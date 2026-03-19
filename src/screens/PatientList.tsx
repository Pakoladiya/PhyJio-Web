import React, { useState } from 'react'
import { useDataStore } from '../store/dataStore'
import { useNavigate } from 'react-router-dom'

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#FEDA77,#F58529)',
  'linear-gradient(135deg,#F58529,#DD2A7B)',
  'linear-gradient(135deg,#DD2A7B,#8134AF)',
  'linear-gradient(135deg,#8134AF,#515BD4)',
  'linear-gradient(135deg,#515BD4,#DD2A7B)',
]

export default function PatientList() {
  const { patients } = useDataStore()
  const navigate     = useNavigate()
  const [q, setQ]    = useState('')

  const list = patients.filter(p =>
    p.isActive &&
    (p.fullName.toLowerCase().includes(q.toLowerCase()) ||
     p.ailment.toLowerCase().includes(q.toLowerCase()))
  )

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100%', paddingBottom: 100 }}>

      {/* ── Header ── */}
      <div style={{ padding: '56px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          {/* Large Title */}
          <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: -0.5 }}>Patients</h1>
          <button
            onClick={() => navigate('/phyjio/patients/add')}
            style={{
              width: 40, height: 40, borderRadius: 20,
              background: 'var(--ig-gradient)',
              color: '#fff', fontSize: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(221,42,123,0.35)',
            }}>+</button>
        </div>

        {/* iOS-style search bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(118,118,128,0.12)',
          borderRadius: 14, padding: '10px 14px', marginBottom: 20,
        }}>
          <span style={{ fontSize: 16, color: 'var(--text-muted)', flexShrink: 0 }}>🔍</span>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search name or ailment…"
            style={{
              flex: 1, fontSize: 17, background: 'none', border: 'none',
              color: 'var(--text)', outline: 'none',
            }}
          />
          {q && (
            <button
              onClick={() => setQ('')}
              style={{ fontSize: 16, color: 'var(--text-muted)', lineHeight: 1, padding: 2 }}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── List ── */}
      <div style={{ padding: '0 20px' }}>
        {list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 52, marginBottom: 16 }}>👥</p>
            <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-secondary)' }}>
              {q ? 'No results' : 'No patients yet'}
            </p>
            <p style={{ fontSize: 15, marginTop: 6 }}>
              {q ? 'Try a different search' : 'Tap + to add your first patient'}
            </p>
          </div>
        ) : list.map((p, idx) => (
          <div
            key={p.id}
            onClick={() => navigate(`/phyjio/patients/${p.id}`)}
            style={{
              background:   'var(--surface)',
              borderRadius:  22,
              padding:      '16px 18px',
              marginBottom:  12,
              boxShadow:    'var(--shadow)',
              cursor:       'pointer',
              display:      'flex',
              alignItems:   'center',
              gap:           16,
              transition:   'transform 0.18s cubic-bezier(0.34,1.56,0.64,1)',
            }}
            onTouchStart={e => (e.currentTarget.style.transform = 'scale(0.97)')}
            onTouchEnd={e   => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {/* Avatar */}
            <div style={{
              width: 52, height: 52, borderRadius: 17, flexShrink: 0,
              background: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 800, color: '#fff',
              boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
            }}>
              {p.fullName.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {p.fullName}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 2 }}>
                {p.ailment} · {p.age} yrs
              </p>
              <p style={{ color: 'var(--brand)', fontSize: 13, fontWeight: 600, marginTop: 3 }}>
                ₹{p.chargePerVisit}/visit
              </p>
            </div>

            {/* Chevron */}
            <span style={{ color: 'var(--text-muted)', fontSize: 20, opacity: 0.5 }}>›</span>
          </div>
        ))}
      </div>
    </div>
  )
}
