import React, { useState } from 'react'
import { useDataStore } from '../store/dataStore'
import { useNavigate } from 'react-router-dom'

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
    <div style={{ padding:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:12, marginBottom:16 }}>
        <h2 style={{ fontSize:22, fontWeight:800 }}>Patients</h2>
        <button onClick={() => navigate('/phyjio/patients/add')}
          style={{ width:44, height:44, borderRadius:22, background:'var(--teal)', color:'#fff', fontSize:26, display:'flex', alignItems:'center', justifyContent:'center' }}>
          +
        </button>
      </div>

      <input value={q} onChange={e => setQ(e.target.value)}
        placeholder="🔍  Search name or ailment..."
        style={{ width:'100%', padding:'12px 16px', borderRadius:12, border:'1px solid var(--border)', fontSize:15, marginBottom:16, background:'#fff' }} />

      {list.length === 0 ? (
        <div style={{ textAlign:'center', padding:48, color:'var(--text-muted)' }}>
          <p style={{ fontSize:48, marginBottom:12 }}>👥</p>
          <p style={{ fontWeight:600 }}>No patients yet</p>
          <p style={{ fontSize:13, marginTop:4 }}>Tap + to add your first patient</p>
        </div>
      ) : list.map(p => (
        <div key={p.id} onClick={() => navigate(`/phyjio/patients/${p.id}`)}
          style={{ background:'#fff', borderRadius:14, padding:16, marginBottom:12, boxShadow:'var(--shadow)', cursor:'pointer', display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:50, height:50, borderRadius:25, background:'var(--teal)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, flexShrink:0 }}>
            {p.fullName.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontWeight:700, fontSize:16 }}>{p.fullName}</p>
            <p style={{ color:'var(--text-muted)', fontSize:13 }}>{p.ailment} • {p.age} yrs</p>
            <p style={{ color:'var(--teal)', fontSize:12, fontWeight:600, marginTop:2 }}>₹{p.chargePerVisit}/visit</p>
          </div>
          <span style={{ color:'var(--text-muted)', fontSize:22 }}>›</span>
        </div>
      ))}
    </div>
  )
}