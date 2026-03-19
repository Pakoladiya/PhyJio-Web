import React, { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

type Step = 'name' | 'pin' | 'confirm' | 'biometric'

export default function RegisterScreen() {
  const { register, setupBiometric } = useAuthStore()
  const navigate = useNavigate()

  const [step,      setStep]  = useState<Step>('name')
  const [prefix,    setPrefix]  = useState('Dr.')
  const [firstName, setFirst]   = useState('')
  const [lastName,  setLast]    = useState('')
  const [suffix,    setSuffix]  = useState('PT')
  const [pin,       setPin]     = useState('')
  const [confirm,   setConfirm] = useState('')
  const [tempPin,   setTempPin] = useState('')
  const [shake,     setShake]   = useState(false)
  const [error,     setError]   = useState('')
  const [bioLoading,setBio]     = useState(false)

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
      const next = pin + d; setPin(next)
      if (next.length === 4) { setTempPin(next); setPin(''); setStep('confirm') }
    } else {
      const next = confirm + d; setConfirm(next)
      if (next.length === 4) {
        if (next === tempPin) {
          register(prefix.trim(), firstName.trim(), lastName.trim(), suffix.trim(), next)
          setStep('biometric')
        } else {
          triggerShake('PINs do not match — try again')
          setConfirm(''); setTempPin(''); setStep('pin')
        }
      }
    }
  }

  function delPin() {
    if (step === 'confirm') setConfirm(c => c.slice(0,-1))
    else setPin(p => p.slice(0,-1))
  }

  async function handleBiometric() {
    setBio(true)
    await setupBiometric()
    setBio(false)
    navigate('/phygeo', { replace: true })
  }

  const current = step === 'confirm' ? confirm : pin
  const keys    = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  // Shared glass-card style
  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.28)',
    borderRadius: 32, padding: '32px 24px',
    width: '100%', maxWidth: 340,
  }
  const inp: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 14,
    border: '1px solid rgba(255,255,255,0.25)',
    background: 'rgba(255,255,255,0.18)',
    color: '#fff', fontSize: 17, marginBottom: 12,
    boxSizing: 'border-box', outline: 'none',
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--ig-gradient)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      {/* Logo */}
      <img src="/icon-192.png" alt="PhyGeo" style={{
        width: 80, height: 80, borderRadius: 22,
        marginBottom: 12, boxShadow: '0 8px 28px rgba(0,0,0,0.22)',
      }} />
      <h1 style={{ color: '#fff', fontSize: 30, fontWeight: 800, marginBottom: 4 }}>PhyGeo</h1>
      <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, marginBottom: 36, fontWeight: 500 }}>
        Let's set up your account
      </p>

      {/* ── Step 1: Name ── */}
      {step === 'name' && (
        <div style={card}>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 18, marginBottom: 22, textAlign: 'center' }}>
            What's your name?
          </p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input placeholder="Dr." value={prefix} onChange={e => setPrefix(e.target.value)}
              style={{ ...inp, width: 72, marginBottom: 0, flexShrink: 0, textAlign: 'center' }} />
            <input placeholder="First Name *" value={firstName}
              onChange={e => { setFirst(e.target.value); setError('') }}
              style={{ ...inp, marginBottom: 0, flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <input placeholder="Last Name" value={lastName} onChange={e => setLast(e.target.value)}
              style={{ ...inp, marginBottom: 0, flex: 1 }} />
            <input placeholder="PT" value={suffix} onChange={e => setSuffix(e.target.value)}
              style={{ ...inp, width: 60, marginBottom: 0, flexShrink: 0, textAlign: 'center' }} />
          </div>
          {firstName && (
            <p style={{ color: 'rgba(255,255,255,0.75)', textAlign: 'center', fontSize: 14, marginBottom: 16 }}>
              {[prefix, firstName, lastName, suffix].filter(Boolean).join(' ')}
            </p>
          )}
          {error && <p style={{ color: '#FFD0D0', fontSize: 13, textAlign: 'center', marginBottom: 14 }}>{error}</p>}
          <button onClick={submitName} style={{
            width: '100%', padding: 16, borderRadius: 18,
            background: '#fff', color: 'var(--brand)', fontSize: 17, fontWeight: 700,
            boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          }}>Continue →</button>
        </div>
      )}

      {/* ── Step 2 & 3: PIN ── */}
      {(step === 'pin' || step === 'confirm') && (
        <div style={{ ...card, animation: shake ? 'shake 0.45s ease' : 'none' }}>
          <p style={{ color: '#fff', textAlign: 'center', fontSize: 17, fontWeight: 600, marginBottom: 28 }}>
            {step === 'pin' ? 'Create a 4-digit PIN' : 'Confirm your PIN'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 36 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{
                width: 14, height: 14, borderRadius: '50%',
                background: i < current.length ? '#fff' : 'rgba(255,255,255,0.28)',
                transition: 'background 0.15s, transform 0.15s',
                transform: i < current.length ? 'scale(1.15)' : 'scale(1)',
              }} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {keys.map((k, i) => (
              <button key={i} onClick={() => k === '⌫' ? delPin() : k ? pressPin(k) : undefined}
                style={{
                  height: 64, borderRadius: 18, fontSize: 26, fontWeight: 700,
                  background: k === '' ? 'transparent' : 'rgba(255,255,255,0.18)',
                  color: '#fff', border: k === '' ? 'none' : '1px solid rgba(255,255,255,0.12)',
                  cursor: k === '' ? 'default' : 'pointer',
                }}>{k}</button>
            ))}
          </div>
          {error && <p style={{ color: '#FFD0D0', textAlign: 'center', marginTop: 18, fontSize: 14 }}>{error}</p>}
        </div>
      )}

      {/* ── Step 4: Biometric ── */}
      {step === 'biometric' && (
        <div style={{ ...card, textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🔐</div>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Enable Biometric?</p>
          <p style={{ color: 'rgba(255,255,255,0.70)', fontSize: 15, marginBottom: 28, lineHeight: 1.5 }}>
            Use fingerprint or Face ID to unlock instantly
          </p>
          <button onClick={handleBiometric} disabled={bioLoading} style={{
            width: '100%', padding: 16, borderRadius: 18,
            background: '#fff', color: 'var(--brand)', fontSize: 17, fontWeight: 700,
            marginBottom: 12, boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          }}>
            {bioLoading ? 'Setting up…' : '👆 Enable Biometric'}
          </button>
          <button onClick={() => navigate('/phygeo', { replace: true })} style={{
            width: '100%', padding: 14, borderRadius: 18,
            border: '1px solid rgba(255,255,255,0.35)',
            background: 'transparent', color: '#fff', fontSize: 15,
          }}>Skip for now</button>
        </div>
      )}

      <style>{`
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-11px)}40%{transform:translateX(10px)}60%{transform:translateX(-7px)}80%{transform:translateX(7px)}}
        input::placeholder{color:rgba(255,255,255,0.45)}
      `}</style>
    </div>
  )
}
