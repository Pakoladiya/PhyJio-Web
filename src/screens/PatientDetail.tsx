import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDataStore } from '../store/dataStore'

export default function PatientDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { patients, getPatientVisits, updateVisit } = useDataStore()
  const patient    = patients.find(p => p.id === id)
  const visits     = getPatientVisits(id!)

  if (!patient) return <div style={{ padding:32, textAlign:'center' }}>Patient not found</div>

  const done        = visits.filter(v => v.status === 'completed')
  const totalBilled = done.reduce((s, v) => s + v.charge, 0)
  const totalPaid   = done.filter(v => v.isPaid).reduce((s, v) => s + v.charge, 0)
  const balance     = totalBilled - totalPaid

  return (
    <div style={{ padding:16 }}>
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
        {patient.address && <p style={{ marginTop:10, opacity:0.75, fontSize:13 }}>📍 {patient.address}</p>}
        {patient.referredBy && <p style={{ marginTop:4, opacity:0.75, fontSize:13 }}>👨‍⚕️ Ref: {patient.referredBy}</p>}
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
        {[
          { label:'Visits',  value: done.length         },
          { label:'Billed',  value: `₹${totalBilled}`   },
          { label:'Balance', value: `₹${balance}`        },
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
          { label:'▶ Start Visit',   bg:'var(--teal)',  color:'#fff',            go:() => navigate(`/phyjio/visit/active/${patient.id}`) },
          { label:'💬 WhatsApp',     bg:'#25D366',      color:'#fff',            go:() => navigate('/phyjio/messages', { state:{ patient } }) },
          { label:'🧾 Generate Bill',bg:'#fff',         color:'var(--text)',      go:() => navigate('/phyjio/billing',  { state:{ patient } }) },
          { label:'✏️ Edit',         bg:'#fff',         color:'var(--text)',      go:() => navigate('/phyjio/patients/add', { state:{ patient } }) },
        ].map((a, i) => (
          <button key={i} onClick={a.go}
            style={{ height:52, borderRadius:12, background:a.bg, color:a.color, fontWeight:700, fontSize:14, border:'1px solid var(--border)', boxShadow:'var(--shadow)' }}>
            {a.label}
          </button>
        ))}
      </div>

      {/* Visit history */}
      <h3 style={{ fontSize:16, fontWeight:700, marginBottom:12 }}>Visit History</h3>
      {done.length === 0 ? (
        <p style={{ textAlign:'center', color:'var(--text-muted)', padding:24 }}>No visits yet</p>
      ) : done.map(v => (
        <div key={v.id} style={{ background:'#fff', borderRadius:12, padding:'12px 14px', marginBottom:10, boxShadow:'var(--shadow)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <p style={{ fontWeight:600, fontSize:14 }}>{new Date(v.startTime).toLocaleDateString('en-IN')}</p>
            <p style={{ fontSize:12, color:'var(--text-muted)' }}>{v.durationMin ? `${v.durationMin} min` : '—'}</p>
            {v.notes && <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{v.notes.slice(0,40)}{v.notes.length>40?'...':''}</p>}
          </div>
          <div style={{ textAlign:'right', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
            <p style={{ fontWeight:700, color:'var(--teal)' }}>₹{v.charge}</p>
            <button onClick={() => updateVisit(v.id, { isPaid: !v.isPaid })}
              style={{ fontSize:11, padding:'3px 10px', borderRadius:20, cursor:'pointer', border:'none',
                background: v.isPaid ? '#E8FFF3' : '#FFF3E0',
                color:      v.isPaid ? 'var(--success)' : 'var(--warning)' }}>
              {v.isPaid ? '✓ Paid' : 'Unpaid'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}