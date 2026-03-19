import React, { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

type Step = 'name' | 'pin' | 'confirm' | 'biometric'

export default function RegisterScreen() {
  const { register, setupBiometric } = useAuthStore()
  const navigate = useNavigate()

  const [step, setStep]         = useState<Step>('name')
  const [firstName, setFirst]   = useState('')
  const [lastName, setLast]     = useState('')
  const [pin, setPin]           = useState('')
  const [confirm, setConfirm]   = useState('')
  const [tempPin, setTempPin]   = useState('')
  const [shake, setShake]       = useState(false)
  const [error, setError]       = useState('')
  const [bioLoading, setBio]    = useState(false)

  function triggerShake(msg: string) {
    setError(msg); setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  function submitName() {
    if (!firstName.trim()) { setError('Please enter your first name'); return }
    setError(''); setStep('pin')
  }

  function pressPin(d: string) {
    setError('')
    if (step === 'pin') {
      const next = pin + d
      setPin(next)
      if (next.length === 4) { setTempPin(next); setPin(''); setStep('confirm') }
    } else {
      const next = confirm + d
      setConfirm(next)
      if (next.length === 4) {
        if (next === tempPin) {
          register(firstName.trim(), lastName.trim(), next)
          setStep('biometric')
        } else {
          triggerShake('PINs do not match. Try again.')
          setConfirm(''); setTempPin(''); setStep('pin')
        }
      }
    }
  }

  function delPin() {
    if (step === 'confirm') setConfirm(c => c.slice(0, -1))
    else setPin(p => p.slice(0, -1))
  }

  async function handleBiometric() {
    setBio(true)
    await setupBiometric()
    setBio(false)
    navigate('/phyjio', { replace: true })
  }

  const current = step === 'confirm' ? confirm : pin
  const keys    = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  return (
    <div style={{ minHeight: '100vh', background: 'var(--teal)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>

      <img src="/icon-192.png" alt="PhyJio" style={{ width: 72, height: 72, borderRadius: 18, marginBottom: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }} />
      <h1 style={{ color: '#fff', fontSize: 30, fontWeight: 800, marginBottom: 4 }}>PhyJio</h1>
      <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 32 }}>Let's set up your account</p>

      {/* ── STEP 1: Name ── */}
      {step === 'name' && (
        <div style={{ background: 'rgba(255,255,255,0.13)', borderRadius: 24, padding: '32px 24px', width: '100%', maxWidth: 320 }}>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 20, textAlign: 'center' }}>What's your name?</p>

          <input
            placeholder="First Name *"
            value={firstName}
            onChange={e => { setFirst(e.target.value); setError('') }}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 12, border: 'none',
              background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 15,
              marginBottom: 12, outline: 'none', boxSizing: 'border-box'
            }}
          />
          <input
            placeholder="Last Name (optional)"
            value={lastName}
            onChange={e => setLast(e.target.value)}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 12, border: 'none',
              background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: 15,
              marginBottom: 20, outline: 'none', boxSizing: 'border-box'
            }}
          />

          {error && <p style={{ color: '#FFD0D0', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</p>}

          <button onClick={submitName} style={{
            width: '100%', padding: '16px', borderRadius: 14, border: 'none',
            background: '#fff', color: 'var(--teal)', fontSize: 16, fontWeight: 700, cursor: 'pointer'
          }}>
            Continue →
          </button>
        </div>
      )}

      {/* ── STEP 2 & 3: PIN ── */}
      {(step === 'pin' || step === 'confirm') && (
        <div style={{
          background: 'rgba(255,255,255,0.13)', borderRadius: 24, padding: '32px 28px',
          width: '100%', maxWidth: 320,
          animation: shake ? 'shake 0.4s' : 'none'
        }}>
          <p style={{ color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: 600, marginBottom: 24 }}>
            {step === 'pin' ? 'Create a 4-digit PIN' : 'Confirm your PIN'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginBottom: 32 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: i < current.length ? '#fff' : 'rgba(255,255,255,0.3)', transition: 'background 0.15s' }} />
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {keys.map((k, i) => (
              <button key={i}
                onClick={() => k === '⌫' ? delPin() : k ? pressPin(k) : undefined}
                style={{
                  height: 64, borderRadius: 16, fontSize: 24, fontWeight: 700,
                  background: k === '' ? 'transparent' : 'rgba(255,255,255,0.15)',
                  color: '#fff', border: 'none',
                  cursor: k === '' ? 'default' : 'pointer',
                }}
              >
                {k}
              </button>
            ))}
          </div>

          {error && <p style={{ color: '#FFD0D0', textAlign: 'center', marginTop: 16, fontSize: 13 }}>{error}</p>}
        </div>
      )}

      {/* ── STEP 4: Biometric ── */}
      {step === 'biometric' && (
        <div style={{ background: 'rgba(255,255,255,0.13)', borderRadius: 24, padding: '32px 24px', width: '100%', maxWidth: 320, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🔐</div>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Enable Biometric Login?</p>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 28 }}>
            Use fingerprint or face ID to unlock the app instantly
          </p>

          <button onClick={handleBiometric} disabled={bioLoading} style={{
            width: '100%', padding: 16, borderRadius: 14, border: 'none',
            background: '#fff', color: 'var(--teal)', fontSize: 16, fontWeight: 700,
            cursor: 'pointer', marginBottom: 12
          }}>
            {bioLoading ? 'Setting up…' : '👆 Enable Biometric'}
          </button>

          <button onClick={() => navigate('/phyjio', { replace: true })} style={{
            width: '100%', padding: 14, borderRadius: 14, border: '1.5px solid rgba(255,255,255,0.4)',
            background: 'transparent', color: '#fff', fontSize: 14, cursor: 'pointer'
          }}>
            Skip for now
          </button>
        </div>
      )}

      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-10px)} 40%{transform:translateX(10px)} 60%{transform:translateX(-8px)} 80%{transform:translateX(8px)} }
        input::placeholder { color: rgba(255,255,255,0.5); }
      `}</style>
    </div>
  )
}
