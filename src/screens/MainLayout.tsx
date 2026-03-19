import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'

const tabs = [
  { to: '/phyjio',          icon: '🏠', label: 'Home',    end: true  },
  { to: '/phyjio/patients', icon: '👥', label: 'Patients'            },
  { to: '/phyjio/visits',   icon: '⏱️', label: 'Visits'             },
  { to: '/phyjio/records',  icon: '📂', label: 'Records'             },
  { to: '/phyjio/billing',  icon: '🧾', label: 'Billing'             },
]

export default function MainLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: 480, margin: '0 auto' }}>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 84 }}>
        <Outlet />
      </div>

      {/* ── Glassmorphism Tab Bar (iOS HIG) ── */}
      <nav style={{
        position:   'fixed',
        bottom:      0,
        left:       '50%',
        transform:  'translateX(-50%)',
        width:      '100%',
        maxWidth:    480,
        height:      82,
        paddingBottom: 12,
        display:    'flex',
        zIndex:      200,
        background: 'rgba(255, 255, 255, 0.82)',
        backdropFilter:       'saturate(180%) blur(24px)',
        WebkitBackdropFilter: 'saturate(180%) blur(24px)',
        borderTop:  '0.5px solid rgba(0, 0, 0, 0.14)',
      }}>
        {tabs.map(t => (
          <NavLink key={t.to} to={t.to} end={t.end}
            style={({ isActive }) => ({
              flex:            1,
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              justifyContent: 'center',
              gap:             2,
              paddingTop:      8,
              fontSize:        10,
              fontWeight:      isActive ? 700 : 500,
              letterSpacing:   0.1,
              color:           isActive ? 'var(--brand)' : 'var(--text-muted)',
              textDecoration: 'none',
              transition:     'color 0.22s ease',
            })}>
            <span style={{ fontSize: 22, lineHeight: 1.2, display: 'block', transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1)' }}>
              {t.icon}
            </span>
            {t.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
