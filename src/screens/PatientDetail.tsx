import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDataStore } from '../store/dataStore'

// ── Calendar helpers ─────────────────────────────────────────
const DAY_HDR   = ['Su','Mo','Tu','We','Th','Fr','Sa']
const MON_NAMES = ['January','February','March','April','May','June',
                   'July','August','September','October','November','December']

function ymd(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}
function keyLabel(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m-1, d).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })
}

const AVATAR_G = ['linear-gradient(135deg,#FEDA77,#F58529)','linear-gradient(135deg,#F58529,#DD2A7B)','linear-gradient(135deg,#DD2A7B,#8134AF)','linear-gradient(135deg,#8134AF,#515BD4)']

export default function PatientDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { patients, getPatientVisits, updateVisit, addVisit, deleteVisit } = useDataStore()
  const patient = patients.find(p => p.id === id)
  const visits  = getPatientVisits(id!)

  const today = new Date()
  const [showCal,   setShowCal]   = useState(false)
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selKey,    setSelKey]    = useState('')
  const [calNotes,  setCalNotes]  = useState('')
  const [added,     setAdded]     = useState(false)

  if (!patient) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Patient not found</div>

  const pIdx        = patients.indexOf(patient)
  const done        = visits.filter(v => v.status === 'completed')
  const totalBilled = done.reduce((s, v) => s + v.charge, 0)
  const totalPaid   = done.filter(v => v.isPaid).reduce((s, v) => s + v.charge, 0)
  const balance     = totalBilled - totalPaid

  // Visit-count map for calendar dots
  const visitMap: Record<string, number> = {}
  done.forEach(v => { const k = ymd(new Date(v.startTime)); visitMap[k] = (visitMap[k] || 0) + 1 })

  const firstDow  = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMon = new Date(viewYear, viewMonth + 1, 0).getDate()
  const todayKey  = ymd(today)
  const isAtMax   = viewYear === today.getFullYear() && viewMonth === today.getMonth()

  function prevMonth() {
    setSelKey('')
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) } else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (isAtMax) return; setSelKey('')
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) } else setViewMonth(m => m + 1)
  }
  function tapDay(d: number) {
    const k = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    if (new Date(viewYear, viewMonth, d) > today) return
    setSelKey(prev => prev === k ? '' : k); setCalNotes(''); setAdded(false)
  }
  function addVisitForDay() {
    if (!selKey) return
    const [y, m, d] = selKey.split('-').map(Number)
    addVisit({ patientId: patient!.id, startTime: new Date(y, m-1, d, 12).getTime(), status: 'completed', charge: patient!.chargePerVisit, isPaid: false, notes: calNotes })
    setCalNotes(''); setAdded(true); setTimeout(() => setAdded(false), 1800)
  }
  const selDayVisits = selKey ? done.filter(v => ymd(new Date(v.startTime)) === selKey) : []

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100%', paddingBottom: 100 }}>

      {/* ── Gradient Profile Header ── */}
      <div style={{ background: 'var(--ig-gradient)', padding: '52px 20px 24px', borderRadius: '0 0 32px 32px', marginBottom: 24 }}>
        <button onClick={() => navigate(-1)}
          style={{ width: 36, height: 36, borderRadius: 18, background: 'rgba(255,255,255,0.22)', color: '#fff', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          ‹
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 22, background: AVATAR_G[pIdx % AVATAR_G.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.20)' }}>
            {patient.fullName.charAt(0)}
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>{patient.fullName}</h1>
            <p style={{ color: 'rgba(255,255,255,0.80)', fontSize: 14, marginTop: 3 }}>{patient.ailment} · {patient.age} yrs</p>
            {patient.phone && <a href={`tel:${patient.phone}`} style={{ color: 'rgba(255,255,255,0.70)', fontSize: 13, marginTop: 2, display: 'block' }}>📞 {patient.phone}</a>}
          </div>
        </div>
        {patient.address    && <p style={{ marginTop: 10, color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>📍 {patient.address}</p>}
        {patient.referredBy && <p style={{ marginTop: 3,  color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>👨‍⚕️ Ref: {patient.referredBy}</p>}
      </div>

      <div style={{ padding: '0 20px' }}>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Visits',  value: done.length,       color: 'var(--brand)' },
            { label: 'Billed',  value: `₹${totalBilled}`, color: '#FF9500'      },
            { label: 'Balance', value: `₹${balance}`,     color: balance > 0 ? '#FF3B30' : '#34C759' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--surface)', borderRadius: 20, padding: '14px 10px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
              <p style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Action buttons 2×2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
          {[
            { label: '▶ Start Visit',    bg: 'var(--ig-gradient)', color: '#fff',        shadow: '0 4px 14px rgba(221,42,123,0.30)', go: () => navigate(`/phygeo/visit/active/${patient.id}`) },
            { label: '📋 Log Visit',     bg: 'rgba(221,42,123,0.08)', color: 'var(--brand)', shadow: 'none', go: () => { setShowCal(c => !c); setSelKey(''); setCalNotes('') } },
            { label: '🧾 Bill',          bg: 'var(--surface)', color: 'var(--text)',     shadow: 'var(--shadow)', go: () => navigate('/phygeo/billing', { state: { patient } }) },
            { label: '✏️ Edit',          bg: 'var(--surface)', color: 'var(--text)',     shadow: 'var(--shadow)', go: () => navigate('/phygeo/patients/add', { state: { patient } }) },
          ].map((a, i) => (
            <button key={i} onClick={a.go}
              style={{ height: 54, borderRadius: 18, background: a.bg, color: a.color, fontWeight: 700, fontSize: 14, boxShadow: a.shadow, border: a.bg === 'var(--surface)' ? '1px solid var(--separator)' : 'none' }}>
              {a.label}
            </button>
          ))}
        </div>

        {/* ── Calendar Panel ── */}
        {showCal && (
          <div style={{ background: 'var(--surface)', borderRadius: 26, padding: 18, boxShadow: 'var(--shadow-md)', marginBottom: 24 }}>

            {/* Month nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <button onClick={prevMonth} style={{ width: 38, height: 38, borderRadius: 13, background: 'rgba(118,118,128,0.12)', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
              <span style={{ fontWeight: 800, fontSize: 17 }}>{MON_NAMES[viewMonth]} {viewYear}</span>
              <button onClick={nextMonth} style={{ width: 38, height: 38, borderRadius: 13, background: 'rgba(118,118,128,0.12)', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isAtMax ? 0.22 : 1 }}>›</button>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 6 }}>
              {DAY_HDR.map(h => (
                <div key={h} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', padding: '2px 0' }}>{h}</div>
              ))}
            </div>

            {/* Date cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
              {Array.from({ length: firstDow }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMon }).map((_, i) => {
                const d    = i + 1
                const k    = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
                const isFut = new Date(viewYear, viewMonth, d) > today
                const isTod = k === todayKey
                const isSel = k === selKey
                const cnt   = visitMap[k] || 0
                return (
                  <button key={d} onClick={() => tapDay(d)} disabled={isFut}
                    style={{
                      height: 44, borderRadius: 12,
                      border: isSel ? '2px solid var(--brand)' : isTod ? '1.5px solid var(--brand)' : '1px solid transparent',
                      cursor: isFut ? 'default' : 'pointer',
                      background: isSel ? 'var(--brand)' : isTod ? 'var(--teal-light)' : 'rgba(118,118,128,0.07)',
                      color:  isSel ? '#fff' : isFut ? '#D1D1D6' : 'var(--text)',
                      fontWeight: (isTod || isSel) ? 800 : 400, fontSize: 14,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
                    }}>
                    {d}
                    {cnt > 0 && (
                      <span style={{
                        width: cnt > 1 ? 'auto' : 5, height: 5, minWidth: 5,
                        padding: cnt > 1 ? '0 3px' : 0, borderRadius: 3,
                        fontSize: 7, lineHeight: '5px', fontWeight: 800,
                        background: isSel ? 'rgba(255,255,255,0.70)' : 'var(--brand)',
                        color: isSel ? 'var(--brand)' : '#fff',
                      }}>{cnt > 1 ? cnt : ''}</span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 14, marginTop: 12, justifyContent: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: 4, background: 'var(--brand)', display: 'inline-block' }} /> visits logged
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>tap date to log visit</span>
            </div>

            {/* Selected day panel */}
            {selKey && (
              <div style={{ marginTop: 16, background: 'var(--teal-light)', borderRadius: 18, padding: 16 }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--brand)', marginBottom: 8 }}>
                  📅 {keyLabel(selKey)}
                </p>
                {selDayVisits.length > 0 && (
                  <p style={{ fontSize: 12, color: 'var(--brand)', marginBottom: 10, opacity: 0.75 }}>
                    {selDayVisits.length} visit{selDayVisits.length > 1 ? 's' : ''} already on this day
                  </p>
                )}
                <input
                  placeholder="Notes (optional)"
                  value={calNotes} onChange={e => setCalNotes(e.target.value)}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 12,
                    border: '1.5px solid rgba(221,42,123,0.20)',
                    background: '#fff', fontSize: 14, marginBottom: 10,
                    boxSizing: 'border-box', outline: 'none', color: 'var(--text)',
                  }}
                />
                <button onClick={addVisitForDay}
                  style={{
                    width: '100%', padding: '14px 0', borderRadius: 16,
                    background: added ? '#34C759' : 'var(--ig-gradient)',
                    color: '#fff', fontWeight: 800, fontSize: 15,
                    boxShadow: added ? '0 4px 12px rgba(52,199,89,0.30)' : '0 4px 14px rgba(221,42,123,0.30)',
                    transition: 'background 0.3s',
                  }}>
                  {added ? '✓ Visit Added!' : `➕ Add Visit  ·  ₹${patient.chargePerVisit}`}
                </button>
              </div>
            )}

            <button onClick={() => { setShowCal(false); setSelKey('') }}
              style={{ width: '100%', marginTop: 14, padding: 12, borderRadius: 14, background: 'rgba(118,118,128,0.10)', color: 'var(--text-muted)', fontSize: 14, fontWeight: 500 }}>
              Close Calendar
            </button>
          </div>
        )}

        {/* ── Visit History ── */}
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>
          Visit History
        </p>
        {done.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 40, marginBottom: 10 }}>📋</p>
            <p style={{ fontSize: 16, fontWeight: 600 }}>No visits yet</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Tap Log Visit to add one</p>
          </div>
        ) : [...done].sort((a, b) => b.startTime - a.startTime).map(v => (
          <div key={v.id} style={{
            background: 'var(--surface)', borderRadius: 20, padding: '14px 16px',
            marginBottom: 10, boxShadow: 'var(--shadow)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15 }}>
                {new Date(v.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                {v.durationMin ? `${v.durationMin} min` : '—'}
              </p>
              {v.notes && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{v.notes.slice(0,50)}{v.notes.length>50?'…':''}</p>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
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
              <button onClick={() => { if(window.confirm('Delete this visit?')) deleteVisit(v.id) }}
                style={{ fontSize: 11, padding: '3px 10px', borderRadius: 22, background: 'rgba(255,59,48,0.10)', color: 'var(--danger)', border: '1px solid rgba(255,59,48,0.18)', fontWeight: 600 }}>
                🗑 Delete
              </button>
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}
