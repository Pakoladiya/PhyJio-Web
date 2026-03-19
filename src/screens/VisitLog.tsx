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

  // ✅ Only completed visits — active and cancelled are excluded
  const list = visits
    .filter(v => v.status === 'completed' && inRange(v.startTime))
    .sort((a, b) => b.startTime - a.startTime)

  const totalRevenue = list.reduce((s, v) => s + v.charge, 0)
  const totalPaid    = list.filter(v => v.isPaid).reduce((s, v) => s + v.charge, 0)
  const totalUnpaid  = totalRevenue - totalPaid

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, paddingTop: 12, marginBottom: 16 }}>Visit Log</h2>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {(['today', 'week', 'month', 'all'] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: '8px 18px', borderRadius: 20, fontSize: 13,
              fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
              background: filter === f ? 'var(--teal)' : '#fff',
              color:      filter === f ? '#fff' : 'var(--text-muted)',
              border:    `1px solid ${filter === f ? 'var(--teal)' : 'var(--border)'}`
            }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Visits',  value: list.length,        color: 'var(--teal)'    },
          { label: 'Revenue', value: `₹${totalRevenue}`, color: 'var(--warning)' },
          { label: 'Unpaid',  value: `₹${totalUnpaid}`,  color: 'var(--danger)'  },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 14, boxShadow: 'var(--shadow)', textAlign: 'center' }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Visit list */}
      {list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>⏱️</p>
          <p style={{ fontWeight: 600 }}>No completed visits</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>
            {filter === 'today' ? 'No visits completed today yet'
             : filter === 'week'  ? 'No visits this week'
             : filter === 'month' ? 'No visits this month'
             : 'No visits recorded yet'}
          </p>
        </div>
      ) : list.map(v => {
        const p = patients.find(x => x.id === v.patientId)
        return (
          <div key={v.id} style={{ background: '#fff', borderRadius: 12, padding: '14px', marginBottom: 10, boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700 }}>{p?.fullName || 'Unknown'}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {new Date(v.startTime).toLocaleDateString('en-IN')} •{' '}
                  {new Date(v.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  {v.durationMin ? ` • ${v.durationMin} min` : ''}
                </p>
                {v.notes && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                    📝 {v.notes.slice(0, 50)}{v.notes.length > 50 ? '...' : ''}
                  </p>
                )}
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <p style={{ fontWeight: 700, color: 'var(--teal)' }}>₹{v.charge}</p>
                {/* ✅ Tap to toggle paid / unpaid */}
                <button onClick={() => updateVisit(v.id, { isPaid: !v.isPaid })}
                  style={{
                    fontSize: 11, padding: '3px 10px', borderRadius: 20,
                    cursor: 'pointer', border: 'none',
                    background: v.isPaid ? '#E8FFF3' : '#FFF3E0',
                    color:      v.isPaid ? 'var(--success)' : 'var(--warning)'
                  }}>
                  {v.isPaid ? '✓ Paid' : 'Unpaid'}
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}