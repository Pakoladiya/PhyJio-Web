import React, { useState } from 'react'
import { useDataStore } from '../store/dataStore'

type Filter = 'today' | 'week' | 'month' | 'all'

export default function VisitLog() {
  const { visits, patients, updateVisit } = useDataStore()
  const [filter, setFilter] = useState<Filter>('today')

  function inRange(ts: number) {
    const now = Date.now()
    const d = new Date(ts), n = new Date()
    if (filter === 'today') return d.toDateString() === n.toDateString()
    if (filter === 'week')  return now - ts < 7 * 86400000
    if (filter === 'month') return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
    return true
  }

  const list = visits
    .filter(v => v.status === 'completed' && inRange(v.startTime))
    .sort((a, b) => b.startTime - a.startTime)

  const totalRevenue = list.reduce((s, v) => s + v.charge, 0)
  const totalPaid    = list.filter(v => v.isPaid).reduce((s, v) => s + v.charge, 0)
  const totalUnpaid  = totalRevenue - totalPaid

  const filterLabels: Record<Filter, string> = {
    today: 'Today', week: 'This Week', month: 'This Month', all: 'All Time',
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100%', paddingBottom: 100 }}>

      {/* ── Header ── */}
      <div style={{ padding: '56px 20px 0' }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: -0.5, marginBottom: 20 }}>
          Visit Log
        </h1>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 20 }}>
          {(Object.keys(filterLabels) as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '9px 20px', borderRadius: 22, whiteSpace: 'nowrap', flexShrink: 0,
                fontSize: 14, fontWeight: 600,
                background: filter === f ? 'var(--brand)' : 'var(--surface)',
                color:      filter === f ? '#fff' : 'var(--text-muted)',
                boxShadow:  filter === f ? '0 4px 12px rgba(221,42,123,0.30)' : 'var(--shadow-sm)',
                border:     filter === f ? 'none' : '1px solid var(--separator)',
                transition: 'all 0.2s ease',
              }}>
              {filterLabels[f]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>

        {/* ── Summary cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Visits',  value: list.length,        color: 'var(--brand)' },
            { label: 'Revenue', value: `₹${totalRevenue}`, color: '#FF9500'      },
            { label: 'Unpaid',  value: `₹${totalUnpaid}`,  color: '#FF3B30'      },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'var(--surface)', borderRadius: 20,
              padding: '16px 10px', boxShadow: 'var(--shadow)', textAlign: 'center',
            }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: s.color, letterSpacing: -0.3 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Visit list ── */}
        {list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '52px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 52, marginBottom: 16 }}>⏱️</p>
            <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-secondary)' }}>No visits yet</p>
            <p style={{ fontSize: 14, marginTop: 6 }}>
              {filter === 'today'  ? 'No visits completed today' :
               filter === 'week'   ? 'No visits this week' :
               filter === 'month'  ? 'No visits this month' : 'No visits recorded'}
            </p>
          </div>
        ) : list.map(v => {
          const p = patients.find(x => x.id === v.patientId)
          return (
            <div key={v.id} style={{
              background: 'var(--surface)', borderRadius: 20,
              padding: '16px 18px', marginBottom: 10, boxShadow: 'var(--shadow)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p?.fullName || 'Unknown'}
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
                  {new Date(v.startTime).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                  {' · '}
                  {new Date(v.startTime).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
                  {v.durationMin ? ` · ${v.durationMin} min` : ''}
                </p>
                {v.notes && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                    📝 {v.notes.slice(0, 45)}{v.notes.length > 45 ? '…' : ''}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, marginLeft: 12 }}>
                <p style={{ fontWeight: 800, fontSize: 17, color: 'var(--brand)' }}>₹{v.charge}</p>
                <button onClick={() => updateVisit(v.id, { isPaid: !v.isPaid })}
                  style={{
                    fontSize: 11, padding: '4px 12px', borderRadius: 22, fontWeight: 700,
                    background: v.isPaid ? 'rgba(52,199,89,0.12)' : 'rgba(255,149,0,0.12)',
                    color:      v.isPaid ? 'var(--success)' : 'var(--warning)',
                    border:     v.isPaid ? '1px solid rgba(52,199,89,0.25)' : '1px solid rgba(255,149,0,0.25)',
                  }}>
                  {v.isPaid ? '✓ Paid' : 'Unpaid'}
                </button>
              </div>
            </div>
          )
        })}

      </div>
    </div>
  )
}
