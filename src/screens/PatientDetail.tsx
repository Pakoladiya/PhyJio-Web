import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDataStore } from '../store/dataStore'

// ── Calendar helpers ─────────────────────────────────────────
const DAY_HDR   = ['Su','Mo','Tu','We','Th','Fr','Sa']
const MON_NAMES = ['January','February','March','April','May','June',
                   'July','August','September','October','November','December']

/** Local YYYY-MM-DD string (no timezone issues) */
function ymd(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}
/** Format a YYYY-MM-DD key into a readable label */
function keyLabel(key: string) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m-1, d).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })
}

// ── Main Component ───────────────────────────────────────────
export default function PatientDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { patients, getPatientVisits, updateVisit, addVisit, deleteVisit } = useDataStore()
  const patient = patients.find(p => p.id === id)
  const visits  = getPatientVisits(id!)

  // Calendar state
  const today = new Date()
  const [showCal,   setShowCal]   = useState(false)
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selKey,    setSelKey]    = useState('')     // 'YYYY-MM-DD'
  const [calNotes,  setCalNotes]  = useState('')
  const [added,     setAdded]     = useState(false)  // flash feedback

  if (!patient) return <div style={{ padding:32, textAlign:'center' }}>Patient not found</div>

  const done        = visits.filter(v => v.status === 'completed')
  const totalBilled = done.reduce((s, v) => s + v.charge, 0)
  const totalPaid   = done.filter(v => v.isPaid).reduce((s, v) => s + v.charge, 0)
  const balance     = totalBilled - totalPaid

  // Map: YYYY-MM-DD → visit count (for dot indicators)
  const visitMap: Record<string, number> = {}
  done.forEach(v => {
    const k = ymd(new Date(v.startTime))
    visitMap[k] = (visitMap[k] || 0) + 1
  })

  // Calendar grid values
  const firstDow   = new Date(viewYear, viewMonth, 1).getDay() // 0=Sun
  const daysInMon  = new Date(viewYear, viewMonth + 1, 0).getDate()
  const todayKey   = ymd(today)
  const isAtMax    = viewYear === today.getFullYear() && viewMonth === today.getMonth()

  function prevMonth() {
    setSelKey('')
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (isAtMax) return
    setSelKey('')
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  function tapDay(d: number) {
    const k = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
    const dayDate = new Date(viewYear, viewMonth, d)
    if (dayDate > today) return          // future — ignore
    setSelKey(prev => prev === k ? '' : k)
    setCalNotes('')
    setAdded(false)
  }

  function addVisitForDay() {
    if (!selKey) return
    const [y, m, d] = selKey.split('-').map(Number)
    const startTime = new Date(y, m - 1, d, 12, 0, 0).getTime()
    addVisit({ patientId: patient!.id, startTime, status: 'completed', charge: patient!.chargePerVisit, isPaid: false, notes: calNotes })
    setCalNotes('')
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const selDayVisits = selKey ? done.filter(v => ymd(new Date(v.startTime)) === selKey) : []

  // ── Styles ────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width:'100%', padding:'10px 12px', borderRadius:10,
    border:'1px solid var(--border)', fontSize:13,
    boxSizing:'border-box', outline:'none', background:'#fff'
  }

  return (
    <div style={{ padding:16, paddingBottom:90 }}>

      {/* Back + Title */}
      <div style={{ display:'flex', alignItems:'center', gap:12, paddingTop:12, marginBottom:20 }}>
        <button onClick={() => navigate(-1)} style={{ fontSize:28, color:'var(--teal)', lineHeight:1, background:'none', border:'none', cursor:'pointer' }}>‹</button>
        <h2 style={{ fontSize:20, fontWeight:800 }}>Patient Profile</h2>
      </div>

      {/* Profile card */}
      <div style={{ background:'var(--teal)', borderRadius:16, padding:20, marginBottom:16, color:'#fff' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ width:60, height:60, borderRadius:30, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:800 }}>
            {patient.fullName.charAt(0)}
          </div>
          <div>
            <h3 style={{ fontSize:20, fontWeight:800 }}>{patient.fullName}</h3>
            <p style={{ opacity:0.85, fontSize:14 }}>{patient.ailment} • {patient.age} yrs</p>
            {patient.phone && <a href={`tel:${patient.phone}`} style={{ opacity:0.85, fontSize:13 }}>📞 {patient.phone}</a>}
          </div>
        </div>
        {patient.address    && <p style={{ marginTop:10, opacity:0.75, fontSize:13 }}>📍 {patient.address}</p>}
        {patient.referredBy && <p style={{ marginTop:4,  opacity:0.75, fontSize:13 }}>👨‍⚕️ Ref: {patient.referredBy}</p>}
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
        {[
          { label:'Visits',  value: done.length        },
          { label:'Billed',  value: `₹${totalBilled}`  },
          { label:'Balance', value: `₹${balance}`       },
        ].map((s, i) => (
          <div key={i} style={{ background:'#fff', borderRadius:12, padding:'12px 8px', textAlign:'center', boxShadow:'var(--shadow)' }}>
            <p style={{ fontSize:18, fontWeight:800, color:'var(--teal)' }}>{s.value}</p>
            <p style={{ fontSize:11, color:'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
        {[
          { label:'▶ Start Visit',    bg:'var(--teal)', color:'#fff',        go:() => navigate(`/phyjio/visit/active/${patient.id}`) },
          { label:'📋 Log Visit',     bg:'#EEF9F9',     color:'var(--teal)', go:() => { setShowCal(c => !c); setSelKey(''); setCalNotes('') } },
          { label:'🧾 Generate Bill', bg:'#fff',         color:'var(--text)', go:() => navigate('/phyjio/billing', { state:{ patient } }) },
          { label:'✏️ Edit',          bg:'#fff',         color:'var(--text)', go:() => navigate('/phyjio/patients/add', { state:{ patient } }) },
        ].map((a, i) => (
          <button key={i} onClick={a.go}
            style={{ height:52, borderRadius:12, background:a.bg, color:a.color, fontWeight:700, fontSize:14, border:'1px solid var(--border)', boxShadow:'var(--shadow)', cursor:'pointer' }}>
            {a.label}
          </button>
        ))}
      </div>

      {/* ── Calendar Panel ─────────────────────────────────── */}
      {showCal && (
        <div style={{ background:'#fff', borderRadius:18, padding:16, boxShadow:'var(--shadow)', marginBottom:20 }}>

          {/* Month nav */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <button onClick={prevMonth}
              style={{ width:36, height:36, borderRadius:10, border:'1px solid var(--border)', background:'#f7f7f7', fontSize:20, cursor:'pointer', lineHeight:1 }}>
              ‹
            </button>
            <span style={{ fontWeight:800, fontSize:16 }}>{MON_NAMES[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth}
              style={{ width:36, height:36, borderRadius:10, border:'1px solid var(--border)', background:'#f7f7f7', fontSize:20, cursor:'pointer', lineHeight:1, opacity: isAtMax ? 0.25 : 1 }}>
              ›
            </button>
          </div>

          {/* Day-of-week headers */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:6 }}>
            {DAY_HDR.map(h => (
              <div key={h} style={{ textAlign:'center', fontSize:11, fontWeight:700, color:'var(--text-muted)', padding:'2px 0' }}>{h}</div>
            ))}
          </div>

          {/* Date cells */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
            {/* leading empty cells */}
            {Array.from({ length: firstDow }).map((_, i) => <div key={`emp${i}`} />)}

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
                    position:'relative', height:42, borderRadius:10,
                    border: isSel ? '2px solid var(--teal)' : isTod ? '1.5px solid var(--teal)' : '1px solid transparent',
                    cursor: isFut ? 'default' : 'pointer',
                    background: isSel ? 'var(--teal)' : isTod ? 'var(--teal-light)' : '#f9f9f9',
                    color:  isSel ? '#fff' : isFut ? '#d0d0d0' : 'var(--text)',
                    fontWeight: (isTod || isSel) ? 800 : 400,
                    fontSize: 14,
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:1,
                  }}>
                  {d}
                  {cnt > 0 && (
                    <span style={{
                      width: cnt > 1 ? 'auto' : 6, height:6,
                      minWidth:6, padding: cnt > 1 ? '0 3px' : 0,
                      borderRadius:4, fontSize:8, lineHeight:'6px',
                      background: isSel ? 'rgba(255,255,255,0.7)' : 'var(--teal)',
                      color: isSel ? 'var(--teal)' : '#fff',
                      fontWeight:700,
                    }}>
                      {cnt > 1 ? cnt : ''}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{ display:'flex', gap:14, marginTop:10, justifyContent:'center' }}>
            <span style={{ fontSize:11, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:4 }}>
              <span style={{ width:8, height:8, borderRadius:4, background:'var(--teal)', display:'inline-block' }} /> = visits logged
            </span>
            <span style={{ fontSize:11, color:'var(--text-muted)' }}>• tap a date to log</span>
          </div>

          {/* Selected date panel */}
          {selKey && (
            <div style={{ marginTop:14, background:'var(--teal-light)', borderRadius:14, padding:14 }}>
              <p style={{ fontWeight:700, fontSize:14, color:'var(--teal)', marginBottom:6 }}>
                📅 {keyLabel(selKey)}
              </p>

              {selDayVisits.length > 0 && (
                <p style={{ fontSize:12, color:'var(--teal)', marginBottom:8, opacity:0.8 }}>
                  {selDayVisits.length} visit{selDayVisits.length > 1 ? 's' : ''} already on this day
                </p>
              )}

              <input placeholder="Notes (optional — e.g. exercises done)"
                value={calNotes} onChange={e => setCalNotes(e.target.value)}
                style={{ ...inputStyle, marginBottom:10, background:'#fff' }} />

              <button onClick={addVisitForDay}
                style={{
                  width:'100%', padding:'13px 0', borderRadius:12, border:'none',
                  background: added ? '#27AE60' : 'var(--teal)',
                  color:'#fff', fontWeight:800, fontSize:15, cursor:'pointer',
                  transition:'background 0.3s'
                }}>
                {added ? '✓ Visit Added!' : `➕ Add Visit  ·  ₹${patient.chargePerVisit}`}
              </button>
            </div>
          )}

          <button onClick={() => { setShowCal(false); setSelKey('') }}
            style={{ width:'100%', marginTop:12, padding:10, borderRadius:12, border:'1px solid var(--border)', background:'transparent', color:'var(--text-muted)', fontSize:13, cursor:'pointer' }}>
            Close
          </button>
        </div>
      )}

      {/* Visit history */}
      <h3 style={{ fontSize:16, fontWeight:700, marginBottom:12 }}>Visit History</h3>
      {done.length === 0 ? (
        <p style={{ textAlign:'center', color:'var(--text-muted)', padding:24 }}>No visits yet</p>
      ) : [...done].sort((a, b) => b.startTime - a.startTime).map(v => (
        <div key={v.id} style={{ background:'#fff', borderRadius:12, padding:'12px 14px', marginBottom:10, boxShadow:'var(--shadow)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <p style={{ fontWeight:600, fontSize:14 }}>
              {new Date(v.startTime).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
            </p>
            <p style={{ fontSize:12, color:'var(--text-muted)' }}>
              {v.durationMin ? `${v.durationMin} min` : '—'}
            </p>
            {v.notes && <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{v.notes.slice(0,50)}{v.notes.length>50?'…':''}</p>}
          </div>
          <div style={{ textAlign:'right', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
            <p style={{ fontWeight:700, color:'var(--teal)' }}>₹{v.charge}</p>
            <button onClick={() => updateVisit(v.id, { isPaid: !v.isPaid })}
              style={{ fontSize:11, padding:'3px 10px', borderRadius:20, cursor:'pointer', border:'none',
                background: v.isPaid ? '#E8FFF3' : '#FFF3E0',
                color:      v.isPaid ? 'var(--success)' : 'var(--warning)' }}>
              {v.isPaid ? '✓ Paid' : 'Unpaid'}
            </button>
            <button onClick={() => { if(window.confirm('Delete this visit?')) deleteVisit(v.id) }}
              style={{ fontSize:11, padding:'2px 8px', borderRadius:20, cursor:'pointer', border:'none', background:'#FFF0F0', color:'#E74C3C' }}>
              🗑 Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
