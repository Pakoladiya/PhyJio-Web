import React from 'react'
import { useDataStore } from '../store/dataStore'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { patients, visits } = useDataStore()
  const { prefix, firstName, suffix, logout } = useAuthStore()
  const navigate = useNavigate()
  const today = new Date()

  const hour = today.getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
  const displayName = [prefix, firstName, suffix].filter(Boolean).join(' ')

  // ✅ Today completed visits only
  const todayCompleted = visits.filter(v => {
    const d = new Date(v.startTime)
    return v.status === 'completed' &&
      d.getDate()     === today.getDate()  &&
      d.getMonth()    === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
  })

  // ✅ Only show active banner if visit started within last 4 hours
  const activeVisit = visits.find(v =>
    v.status === 'active' &&
    Date.now() - v.startTime < 4 * 60 * 60 * 1000
  )

  // ✅ Revenue = today completed visits only
  const todayRevenue = todayCompleted.reduce((s, v) => s + v.charge, 0)

  // ✅ All time completed visits
  const allCompleted = visits.filter(v => v.status === 'completed')

  // ✅ Active patients only
  const activePatients = patients.filter(p => p.isActive).length

  const todayLabel = today.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  const stats = [
    { label: "Today's Visits",  value: todayCompleted.length, color: 'var(--ig-pink)'        },
    { label: "Today's Revenue", value: `₹${todayRevenue}`,    color: 'var(--ig-orange)'       },
    { label: 'Total Patients',  value: activePatients,         color: 'var(--ig-purple)'       },
    { label: 'All Time Visits', value: allCompleted.length,    color: 'var(--ig-deep-purple)'  },
  ]

  const actions = [
    { icon: '👤', label: 'Add Patient',   go: '/phyjio/patients/add' },
    { icon: '⏱️', label: 'Log Visit',    go: '/phyjio/patients'     },
    { icon: '💬', label: 'Send Message', go: '/phyjio/messages'     },
    { icon: '🧾', label: 'Generate Bill',go: '/phyjio/billing'      },
  ]

  return (
    <div style={{ padding: 0, background: 'var(--bg)', minHeight: '100%' }}>

      {/* ✅ Instagram gradient header */}
      <div style={{
        background: 'var(--ig-gradient)',
        padding: '52px 20px 28px 20px',
        borderRadius: '0 0 32px 32px',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{greeting}</p>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.15)' }}>
              {displayName}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 3 }}>{todayLabel}</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => navigate('/phyjio/patients/add')}
              style={{
                width: 44, height: 44, borderRadius: 22,
                background: 'rgba(255,255,255,0.25)',
                color: '#fff', fontSize: 26,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(6px)', border: 'none', cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)'
              }}>+</button>
            <button onClick={() => { logout(); navigate('/phyjio/lock', { replace: true }) }}
              style={{
                width: 44, height: 44, borderRadius: 22,
                background: 'rgba(255,255,255,0.2)',
                color: '#fff', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(6px)', border: '1.5px solid rgba(255,255,255,0.3)', cursor: 'pointer',
              }}>🔒</button>
          </div>
        </div>

        {/* ✅ Active visit banner inside header */}
        {activeVisit && (
          <div onClick={() => navigate(`/phyjio/visit/active/${activeVisit.patientId}`)}
            style={{
              background: 'rgba(255,255,255,0.22)',
              backdropFilter: 'blur(8px)',
              borderRadius: 14,
              padding: '12px 16px',
              marginTop: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              border: '1px solid rgba(255,255,255,0.35)'
            }}>
            <span style={{
              width: 10, height: 10, borderRadius: '50%',
              background: '#fff',
              display: 'inline-block',
              flexShrink: 0,
              animation: 'pulse 1.5s infinite'
            }} />
            <div>
              <p style={{ fontWeight: 700, color: '#fff', fontSize: 13 }}>Visit in progress</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>
                Started {new Date(activeVisit.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} → Tap to open
              </p>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '0 16px 100px 16px' }}>

        {/* ✅ Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: '#fff',
              borderRadius: 18,
              padding: '18px 16px',
              boxShadow: 'var(--shadow)',
              borderTop: `3px solid ${s.color}`
            }}>
              <p style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ✅ Quick actions */}
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>
          Quick Actions
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {actions.map((a, i) => {
            const gradients = [
              'linear-gradient(135deg, #FEDA77, #F58529)',
              'linear-gradient(135deg, #F58529, #DD2A7B)',
              'linear-gradient(135deg, #DD2A7B, #8134AF)',
              'linear-gradient(135deg, #8134AF, #515BD4)',
            ]
            return (
              <button key={i} onClick={() => navigate(a.go)}
                style={{
                  background: '#fff',
                  border: 'none',
                  borderRadius: 18,
                  padding: '20px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: 'var(--shadow)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                {/* Gradient top bar */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: 4, background: gradients[i], borderRadius: '18px 18px 0 0'
                }} />
                <span style={{ fontSize: 30 }}>{a.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{a.label}</span>
              </button>
            )
          })}
        </div>

      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}`}</style>
    </div>
  )
}