import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDataStore } from '../store/dataStore'

function toInputDate(ts: number) {
  return new Date(ts).toISOString().split('T')[0]
}
function toInputTime(ts: number) {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function PatientDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { patients, getPatientVisits, updateVisit, addVisit, deleteVisit } = useDataStore()
  const patient    = patients.find(p => p.id === id)
  const visits     = getPatientVisits(id!)

  // ── Log-visit form state ──────────────────────────────────
  const [logging,     setLogging]     = useState(false)
  const [logDate,     setLogDate]     = useState(toInputDate(Date.now()))
  const [logTime,     setLogTime]     = useState(toInputTime(Date.now()))
  const [logDuration, setLogDuration] = useState('30')
  const [logCharge,   setLogCharge]   = useState('')
  const [logNotes,    setLogNotes]    = useState('')

  if (!patient) return <div style={{ padding:32, textAlign:'center' }}>Patient not found</div>

  const done        = visits.filter(v => v.status === 'completed')
  const totalBilled = done.reduce((s, v) => s + v.charge, 0)
  const totalPaid   = done.filter(v => v.isPaid).reduce((s, v) => s + v.charge, 0)
  const balance     = totalBilled - totalPaid

  function openLogForm() {
    setLogDate(toInputDate(Date.now()))
    setLogTime(toInputTime(Date.now()))
    setLogDuration('30')
    setLogCharge(String(patient!.chargePerVisit))
    setLogNotes('')
    setLogging(true)
  }

  function saveLoggedVisit() {
    const startTime  = new Date(`${logDate}T${logTime}`).getTime()
    const durationMin = Math.max(1, Number(logDuration) || 30)
    const endTime    = startTime + durationMin * 60 * 1000
    const charge     = Number(logCharge) || patient!.chargePerVisit
    addVisit({
      patientId:   patient!.id,
      startTime,
      endTime,
      status:      'completed',
      charge,
      durationMin,
      isPaid:      false,
      notes:       logNotes,
    })
    setLogging(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 13px', borderRadius: 10,
    border: '1px solid var(--border)', fontSize: 14,
    background: '#fff', boxSizing: 'border-box', outline: 'none',
  }

  return (
    <div style={{ padding:16, paddingBottom: 90 }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, paddingTop:12, marginBottom:20 }}>
        <button onClick={() => navigate(-1)} style={{ fontSize:28, color:'var(--teal)', lineHeight:1 }}>‹</button>
        <h2 style={{ fontSize:20, fontWeight:800 }}>Patient Profile</h2>
      </div>

      {/* Profile */}
      <div style={{ background:'var(--teal)', borderRadius:16, padding:20, marginBottom:16, color:'#fff' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ width:60, height:60, borderRadius:30, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:800 }}>
            {patient.fullName.charAt(0)}
          </div>
          <div>
            <h3 style={{ fontSize:20, fontWeight:800 }}>{patient.fullName}</h3>
            <p style={{ opacity:0.85, fontSize:14 }}>{patient.ailment} • {patient.age} yrs</p>
            {patient.phone && (
              <a href={`tel:${patient.phone}`} style={{ opacity:0.85, fontSize:13 }}>📞 {patient.phone}</a>
            )}
          </div>
        </div>
        {patient.address   && <p style={{ marginTop:10, opacity:0.75, fontSize:13 }}>📍 {patient.address}</p>}
        {patient.referredBy && <p style={{ marginTop:4,  opacity:0.75, fontSize:13 }}>👨‍⚕️ Ref: {patient.referredBy}</p>}
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
        {[
          { label:'Visits',  value: done.length       },
          { label:'Billed',  value: `₹${totalBilled}` },
          { label:'Balance', value: `₹${balance}`      },
        ].map((s, i) => (
          <div key={i} style={{ background:'#fff', borderRadius:12, padding:'12px 8px', textAlign:'center', boxShadow:'var(--shadow)' }}>
            <p style={{ fontSize:18, fontWeight:800, color:'var(--teal)' }}>{s.value}</p>
            <p style={{ fontSize:11, color:'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
        {[
          { label:'▶ Start Visit',    bg:'var(--teal)', color:'#fff',       go:() => navigate(`/phyjio/visit/active/${patient.id}`) },
          { label:'📋 Log Visit',     bg:'#EEF9F9',     color:'var(--teal)', go: openLogForm },
          { label:'🧾 Generate Bill', bg:'#fff',         color:'var(--text)', go:() => navigate('/phyjio/billing', { state:{ patient } }) },
          { label:'✏️ Edit',          bg:'#fff',         color:'var(--text)', go:() => navigate('/phyjio/patients/add', { state:{ patient } }) },
        ].map((a, i) => (
          <button key={i} onClick={a.go}
            style={{ height:52, borderRadius:12, background:a.bg, color:a.color, fontWeight:700, fontSize:14, border:'1px solid var(--border)', boxShadow:'var(--shadow)', cursor:'pointer' }}>
            {a.label}
          </button>
        ))}
      </div>

      {/* ── Log Visit Form ─────────────────────────────────── */}
      {logging && (
        <div style={{ background:'#fff', borderRadius:16, padding:16, boxShadow:'var(--shadow)', marginBottom:20 }}>
          <p style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>📋 Log a Visit</p>

          <label style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Date</label>
          <input type="date" value={logDate} onChange={e => setLogDate(e.target.value)}
            style={{ ...inputStyle, marginBottom:10 }} />

          <label style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Start Time</label>
          <input type="time" value={logTime} onChange={e => setLogTime(e.target.value)}
            style={{ ...inputStyle, marginBottom:10 }} />

          <label style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Duration (minutes)</label>
          <input type="number" min="1" placeholder="30" value={logDuration} onChange={e => setLogDuration(e.target.value)}
            style={{ ...inputStyle, marginBottom:10 }} />

          <label style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Charge (₹)</label>
          <input type="number" min="0" placeholder={String(patient.chargePerVisit)} value={logCharge} onChange={e => setLogCharge(e.target.value)}
            style={{ ...inputStyle, marginBottom:10 }} />

          <label style={{ fontSize:12, fontWeight:600, color:'var(--text-muted)', display:'block', marginBottom:4 }}>Notes</label>
          <textarea placeholder="Exercises, observations…" value={logNotes} onChange={e => setLogNotes(e.target.value)}
            style={{ ...inputStyle, marginBottom:12, minHeight:72, resize:'vertical' }} />

          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => setLogging(false)}
              style={{ flex:1, padding:12, borderRadius:12, border:'1px solid var(--border)', background:'#fff', cursor:'pointer', fontSize:14 }}>
              Cancel
            </button>
            <button onClick={saveLoggedVisit}
              style={{ flex:2, padding:12, borderRadius:12, border:'none', background:'var(--teal)', color:'#fff', fontWeight:700, cursor:'pointer', fontSize:14 }}>
              Save Visit
            </button>
          </div>
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
              {new Date(v.startTime).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
              {v.durationMin ? ` · ${v.durationMin} min` : ''}
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
              style={{ fontSize:11, padding:'2px 8px', borderRadius:20, cursor:'pointer', border:'none',
                background:'#FFF0F0', color:'#E74C3C' }}>
              🗑 Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
