import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function LockScreen() {
  const { firstName, hasBiometric, login, loginWithBiometric, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [pin,   setPin]   = useState('')
  const [shake, setShake] = useState(false)
  const [error, setError] = useState('')
  const [bioLoading, setBio] = useState(false)

  useEffect(() => {
    if (isAuthenticated) navigate('/phyjio', { replace: true })
  }, [isAuthenticated])

  // Auto-trigger biometric on mount if available
  useEffect(() => {
    if (hasBiometric) handleBiometric()
  }, [])

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
      if (!ok) { triggerShake('Wrong PIN. Try again.'); setPin('') }
    }
  }

  function del() { setPin(p => p.slice(0, -1)) }

  async function handleBiometric() {
    setBio(true)
    const ok = await loginWithBiometric()
    setBio(false)
    if (!ok) setError('Biometric failed. Enter PIN.')
  }

  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  return (
    <div style={{ minHeight: '100vh', background: 'var(--teal)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>

      <img src="/icon-192.png" alt="PhyJio" style={{ width: 72, height: 72, borderRadius: 18, marginBottom: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }} />
      <h1 style={{ color: '#fff', fontSize: 30, fontWeight: 800, marginBottom: 4 }}>PhyJio</h1>
      <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, marginBottom: 32 }}>
        Welcome back{firstName ? `, ${firstName}` : ''} 👋
      </p>

      <div style={{
        background: 'rgba(255,255,255,0.13)', borderRadius: 24, padding: '32px 28px',
        width: '100%', maxWidth: 320,
        animation: shake ? 'shake 0.4s' : 'none'
      }}>
        <p style={{ color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: 600, marginBottom: 24 }}>Enter PIN</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginBottom: 32 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width: 16, height: 16, borderRadius: '50%', background: i < pin.length ? '#fff' : 'rgba(255,255,255,0.3)', transition: 'background 0.15s' }} />
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {keys.map((k, i) => (
            <button key={i}
              onClick={() => k === '⌫' ? del() : k ? press(k) : undefined}
              style={{
                height: 64, borderRadius: 16, fontSize: 24, fontWeight: 700,
                background: k === '' ? 'transparent' : 'rgba(255,255,255,0.15)',
                color: '#fff', border: 'none',
                cursor: k === '' ? 'default' : 'pointer',
              }}
              onTouchStart={e => { if (k) e.currentTarget.style.background = 'rgba(255,255,255,0.3)' }}
              onTouchEnd={e   => { if (k) e.currentTarget.style.background = 'rgba(255,255,255,0.15)' }}
            >
              {k}
            </button>
          ))}
        </div>

        {error && <p style={{ color: '#FFD0D0', textAlign: 'center', marginTop: 16, fontSize: 13 }}>{error}</p>}
      </div>

      {/* Biometric button */}
      {hasBiometric && (
        <button onClick={handleBiometric} disabled={bioLoading} style={{
          marginTop: 24, display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.35)',
          borderRadius: 16, padding: '14px 28px', color: '#fff', fontSize: 15, fontWeight: 600,
          cursor: 'pointer'
        }}>
          <span style={{ fontSize: 24 }}>👆</span>
          {bioLoading ? 'Verifying…' : 'Use Fingerprint / Face ID'}
        </button>
      )}

      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-10px)} 40%{transform:translateX(10px)} 60%{transform:translateX(-8px)} 80%{transform:translateX(8px)} }
      `}</style>
    </div>
  )
}
