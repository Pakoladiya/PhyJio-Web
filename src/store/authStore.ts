import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  isAuthenticated: boolean
  isRegistered: boolean
  prefix: string
  firstName: string
  lastName: string
  suffix: string
  pin: string
  hasBiometric: boolean
  credentialId: string | null

  register: (prefix: string, firstName: string, lastName: string, suffix: string, pin: string) => void
  login: (entered: string) => boolean
  setupBiometric: () => Promise<boolean>
  loginWithBiometric: () => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isRegistered: false,
      prefix: 'Dr.',
      firstName: '',
      lastName: '',
      suffix: 'PT',
      pin: '',
      hasBiometric: false,
      credentialId: null,

      register: (prefix, firstName, lastName, suffix, pin) => {
        set({ prefix, firstName, lastName, suffix, pin, isRegistered: true, isAuthenticated: true })
      },

      login: (entered: string) => {
        if (entered === get().pin) {
          set({ isAuthenticated: true })
          return true
        }
        return false
      },

      setupBiometric: async () => {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
          if (!available) return false

          const challenge = crypto.getRandomValues(new Uint8Array(32))
          const { firstName, lastName } = get()
          const userId = crypto.getRandomValues(new Uint8Array(16))

          const credential = await navigator.credentials.create({
            publicKey: {
              challenge,
              rp: { name: 'PhyJio', id: window.location.hostname },
              user: {
                id: userId,
                name: `${firstName} ${lastName}`,
                displayName: `${firstName} ${lastName}`,
              },
              pubKeyCredParams: [
                { type: 'public-key', alg: -7 },
                { type: 'public-key', alg: -257 },
              ],
              authenticatorSelection: {
                authenticatorAttachment: 'platform',
                userVerification: 'required',
              },
              timeout: 60000,
            },
          }) as PublicKeyCredential | null

          if (!credential) return false

          const credId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)))
          set({ hasBiometric: true, credentialId: credId })
          return true
        } catch {
          return false
        }
      },

      loginWithBiometric: async () => {
        try {
          const { credentialId } = get()
          if (!credentialId) return false

          const challenge = crypto.getRandomValues(new Uint8Array(32))
          const credIdBytes = Uint8Array.from(atob(credentialId), c => c.charCodeAt(0))

          const assertion = await navigator.credentials.get({
            publicKey: {
              challenge,
              allowCredentials: [{ type: 'public-key', id: credIdBytes, transports: ['internal'] }],
              userVerification: 'required',
              timeout: 60000,
            },
          })

          if (assertion) {
            set({ isAuthenticated: true })
            return true
          }
          return false
        } catch {
          return false
        }
      },

      logout: () => set({ isAuthenticated: false }),
    }),
    { name: 'phyjio-auth' }
  )
)
