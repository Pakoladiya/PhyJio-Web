import React from 'react'
import { useDataStore } from '../store/dataStore'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { patients, visits } = useDataStore()
  const { prefix, firstName, suffix, logout } = useAuthStore()
  const navigate = useNavigate()
  const today    = new Date()

  const hour     = today.getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
  const displayName = [prefix, firstName, suffix].filter(Boolean).join(' ')

  const todayCompleted = visits.filter(v => {
    const d = new Date(v.startTime)
    return v.status === 'completed' &&
      d.getDate()     === today.getDate()  &&
      d.getMonth()    === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
  })

  const activeVisit = visits.find(v =>
    v.status === 'active' && Date.now() - v.startTime < 4 * 60 * 60 * 1000
  )

  const todayRevenue   = todayCompleted.reduce((s, v) => s + v.charge, 0)
  const allCompleted   = visits.filter(v => v.status === 'completed')
  const activePatients = patients.filter(p => p.isActive).length

  const todayLabel = today.toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  const stats = [
    { label: "Today's Visits",  value: todayCompleted.length, color: '#DD2A7B' },
    { label: "Today's Revenue", value: `₹${todayRevenue}`,    color: '#F58529' },
    { label: 'Active Patients', value: activePatients,         color: '#8134AF' },
    { label: 'All-time Visits', value: allCompleted.length,    color: '#515BD4' },
  ]

  const actions = [
    { icon: '👤', label: 'Add Patient',  g: '#FEDA77, #F58529', go: '/phygeo/patients/add' },
    { icon: '⏱️', label: 'Log Visit',   g: '#F58529, #DD2A7B', go: '/phygeo/patients'     },
    { icon: '📂', label: 'Records',      g: '#DD2A7B, #8134AF', go: '/phygeo/records'      },
    { icon: '🧾', label: 'Billing',      g: '#8134AF, #515BD4', go: '/phygeo/billing'      },
  ]

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100%' }}>

      {/* ── Hero Header (gradient) ── */}
      <div style={{
        background:    'var(--ig-gradient)',
        padding:       '56px 20px 30px',
        borderRadius:  '0 0 36px 36px',
        marginBottom:   24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 15, fontWeight: 500, marginBottom: 4 }}>
              {greeting}
            </p>
            {/* Large Title — 34px per HIG */}
            <h1 style={{ fontSize: 34, fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: -0.5 }}>
              {displayName || 'Doctor'}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 13, marginTop: 6, fontWeight: 500 }}>
              {todayLabel}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => navigate('/phygeo/patients/add')}
              style={{
                width: 42, height: 42, borderRadius: 21,
                background: 'rgba(255,255,255,0.22)',
                backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.35)',
                color: '#fff', fontSize: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>+</button>
            <button
              onClick={() => { logout(); navigate('/phygeo/lock', { replace: true }) }}
              style={{
                width: 42, height: 42, borderRadius: 21,
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.28)',
                color: '#fff', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>🔒</button>
          </div>
        </div>

        {/* Active visit banner */}
        {activeVisit && (
          <div
            onClick={() => navigate(`/phygeo/visit/active/${activeVisit.patientId}`)}
            style={{
              background: 'rgba(255,255,255,0.20)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              borderRadius: 20, padding: '14px 18px', marginTop: 20,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
              border: '1px solid rgba(255,255,255,0.35)',
            }}>
            <span style={{
              width: 10, height: 10, borderRadius: '50%', background: '#fff',
              display: 'inline-block', flexShrink: 0, animation: 'pulse 1.5s infinite',
            }} />
            <div>
              <p style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>Visit in progress</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.78)', marginTop: 1 }}>
                {new Date(activeVisit.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · Tap to open
              </p>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '0 20px 100px' }}>

        {/* ── Stats 2×2 ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: 'var(--surface)', borderRadius: 24,
              padding: '20px 18px', boxShadow: 'var(--shadow)',
            }}>
              <p style={{ fontSize: 32, fontWeight: 800, color: s.color, letterSpacing: -0.5, lineHeight: 1 }}>
                {s.value}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Quick Actions ── */}
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>
          Quick Actions
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {actions.map((a, i) => (
            <button key={i} onClick={() => navigate(a.go)}
              style={{
                background: 'var(--surface)', borderRadius: 24,
                padding: '22px 14px 20px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                boxShadow: 'var(--shadow)',
              }}>
              <div style={{
                width: 54, height: 54, borderRadius: 17,
                background: `linear-gradient(135deg, ${a.g})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              }}>
                {a.icon}
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{a.label}</span>
            </button>
          ))}
        </div>

      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.28}}`}</style>
    </div>
  )
}
