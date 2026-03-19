import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function LockScreen() {
  const { firstName, hasBiometric, login, loginWithBiometric, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [pin,      setPin]    = useState('')
  const [shake,    setShake]  = useState(false)
  const [error,    setError]  = useState('')
  const [bioLoading, setBio]  = useState(false)

  useEffect(() => { if (isAuthenticated) navigate('/phyjio', { replace: true }) }, [isAuthenticated])
  useEffect(() => { if (hasBiometric) handleBiometric() }, [])

  function triggerShake(msg: string) {
    setError(msg); setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  function press(d: string) {
    setError('')
    const next = pin + d
    setPin(next)
    if (next.length === 4) {
      const ok = login(next)
      if (!ok) { triggerShake('Wrong PIN — try again'); setPin('') }
    }
  }

  async function handleBiometric() {
    setBio(true)
    const ok = await loginWithBiometric()
    setBio(false)
    if (!ok) setError('Biometric failed — enter PIN')
  }

  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--ig-gradient)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 28,
    }}>

      {/* Logo + Title */}
      <img src="/icon-192.png" alt="PhyJio" style={{
        width: 80, height: 80, borderRadius: 22,
        marginBottom: 12, boxShadow: '0 8px 28px rgba(0,0,0,0.22)',
      }} />
      <h1 style={{ color: '#fff', fontSize: 30, fontWeight: 800, marginBottom: 4 }}>PhyJio</h1>
      <p style={{ color: 'rgba(255,255,255,0.70)', fontSize: 15, marginBottom: 40, fontWeight: 500 }}>
        {firstName ? `Welcome back, ${firstName}` : 'Please unlock to continue'}
      </p>

      {/* PIN Card (glassmorphism) */}
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.30)',
        borderRadius: 32, padding: '32px 28px',
        width: '100%', maxWidth: 330,
        animation: shake ? 'shake 0.45s ease' : 'none',
      }}>
        <p style={{ color: '#fff', textAlign: 'center', fontSize: 17, fontWeight: 600, marginBottom: 28 }}>
          Enter PIN
        </p>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 36 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{
              width: 14, height: 14, borderRadius: '50%',
              background: i < pin.length ? '#fff' : 'rgba(255,255,255,0.30)',
              transition: 'background 0.15s ease, transform 0.15s ease',
              transform: i < pin.length ? 'scale(1.15)' : 'scale(1)',
            }} />
          ))}
        </div>

        {/* Keypad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {keys.map((k, i) => (
            <button key={i}
              onClick={() => k === '⌫' ? setPin(p => p.slice(0,-1)) : k ? press(k) : undefined}
              style={{
                height: 66, borderRadius: 18, fontSize: 26, fontWeight: 700,
                background: k === '' ? 'transparent' : 'rgba(255,255,255,0.18)',
                color: '#fff', border: k === '' ? 'none' : '1px solid rgba(255,255,255,0.12)',
                cursor: k === '' ? 'default' : 'pointer',
                letterSpacing: k === '⌫' ? 0 : 0,
              }}>
              {k}
            </button>
          ))}
        </div>

        {error && (
          <p style={{ color: '#FFD0D0', textAlign: 'center', marginTop: 18, fontSize: 14, fontWeight: 500 }}>
            {error}
          </p>
        )}
      </div>

      {/* Biometric button */}
      {hasBiometric && (
        <button
          onClick={handleBiometric}
          disabled={bioLoading}
          style={{
            marginTop: 24,
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.30)',
            borderRadius: 20, padding: '14px 30px',
            color: '#fff', fontSize: 15, fontWeight: 600,
          }}>
          <span style={{ fontSize: 26 }}>👆</span>
          {bioLoading ? 'Verifying…' : 'Use Fingerprint / Face ID'}
        </button>
      )}

      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-11px)}40%{transform:translateX(10px)}60%{transform:translateX(-7px)}80%{transform:translateX(7px)}}`}</style>
    </div>
  )
}
