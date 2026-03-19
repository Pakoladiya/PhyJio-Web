import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  isAuthenticated: boolean
  hasPin: boolean
  pin: string
  login: (entered: string) => boolean
  logout: () => void
  setPin: (newPin: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      hasPin: false,
      pin: '',

      login: (entered: string) => {
        if (entered === get().pin) {
          set({ isAuthenticated: true })
          return true
        }
        return false
      },

      logout: () => set({ isAuthenticated: false }),

      setPin: (newPin: string) => {
        set({ pin: newPin, hasPin: true, isAuthenticated: true })
      },
    }),
    { name: 'phyjio-auth' }
  )
)