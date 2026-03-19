import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function LockScreen() {
  const { hasPin, login, setPin, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [mode,    setMode]    = useState<'set'|'confirm'|'enter'>('enter')
  const [pin,     setP]       = useState('')
  const [confirm, setConfirm] = useState('')
  const [shake,   setShake]   = useState(false)
  const [error,   setError]   = useState('')
  const [tempPin, setTempPin] = useState('')

  useEffect(() => { if (!hasPin) setMode('set') }, [hasPin])
  useEffect(() => { if (isAuthenticated) navigate('/phyjio', { replace: true }) }, [isAuthenticated])

  function triggerShake(msg: string) {
    setError(msg)
    setShake(true)
    setTimeout(() => { setShake(false) }, 500)
  }

  function press(d: string) {
    setError('')
    if (mode === 'set') {
      const next = pin + d
      setP(next)
      if (next.length === 4) {
        setTempPin(next)
        setP('')
        setMode('confirm')
      }
    } else if (mode === 'confirm') {
      const next = confirm + d
      setConfirm(next)
      if (next.length === 4) {
        if (next === tempPin) {
          setPin(next)
        } else {
          triggerShake('PINs do not match. Try again.')
          setConfirm('')
          setTempPin('')
          setMode('set')
        }
      }
    } else {
      const next = pin + d
      setP(next)
      if (next.length === 4) {
        const ok = login(next)
        if (!ok) {
          triggerShake('Wrong PIN. Try again.')
          setP('')
        }
      }
    }
  }

  function del() {
    if (mode === 'confirm') setConfirm(c => c.slice(0, -1))
    else setP(p => p.slice(0, -1))
  }

  const current = mode === 'confirm' ? confirm : pin
  const title   = mode === 'set'     ? 'Create your PIN'
                : mode === 'confirm' ? 'Confirm your PIN'
                : 'Enter PIN'
  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  return (
    <div style={{ minHeight:'100vh', background:'var(--teal)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ fontSize:72, marginBottom:8 }}>🩺</div>
      <h1 style={{ color:'#fff', fontSize:34, fontWeight:800, marginBottom:4 }}>PhyJio</h1>
      <p  style={{ color:'rgba(255,255,255,0.7)', fontSize:14, marginBottom:40 }}>Home Physio Manager</p>

      <div style={{
        background: 'rgba(255,255,255,0.13)',
        borderRadius: 24, padding: '32px 28px',
        width: '100%', maxWidth: 320,
        animation: shake ? 'shake 0.4s' : 'none'
      }}>
        <p style={{ color:'#fff', textAlign:'center', fontSize:16, fontWeight:600, marginBottom:24 }}>{title}</p>

        {/* Dots */}
        <div style={{ display:'flex', justifyContent:'center', gap:18, marginBottom:32 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width:16, height:16, borderRadius:'50%', background: i < current.length ? '#fff' : 'rgba(255,255,255,0.3)', transition:'background 0.15s' }} />
          ))}
        </div>

        {/* Keypad */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
          {keys.map((k, i) => (
            <button key={i}
              onClick={() => k === '⌫' ? del() : k ? press(k) : undefined}
              style={{
                height:64, borderRadius:16, fontSize:24, fontWeight:700,
                background: k === '' ? 'transparent' : 'rgba(255,255,255,0.15)',
                color:'#fff', border:'none',
                cursor: k === '' ? 'default' : 'pointer',
                transition:'background 0.15s'
              }}
              onTouchStart={e => { if(k) e.currentTarget.style.background='rgba(255,255,255,0.3)' }}
              onTouchEnd={e   => { if(k) e.currentTarget.style.background='rgba(255,255,255,0.15)' }}
            >
              {k}
            </button>
          ))}
        </div>

        {error && (
          <p style={{ color:'#FFD0D0', textAlign:'center', marginTop:16, fontSize:13 }}>{error}</p>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0)    }
          20%      { transform: translateX(-10px) }
          40%      { transform: translateX(10px)  }
          60%      { transform: translateX(-8px)  }
          80%      { transform: translateX(8px)   }
        }
      `}</style>
    </div>
  )
}
