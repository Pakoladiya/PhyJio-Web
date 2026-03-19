import React, { useState } from 'react'
import { useDataStore } from '../store/dataStore'
import { useLocation } from 'react-router-dom'

const TEMPLATES = [
  { id:'delay',        icon:'🕐', label:'Running Late',    color:'#FF8C00' },
  { id:'absent_today', icon:'📅', label:'Absent Today',    color:'#E74C3C' },
  { id:'absent_tmrw',  icon:'📆', label:'Absent Tomorrow', color:'#C0392B' },
  { id:'confirm',      icon:'✅', label:'Confirm Visit',   color:'#27AE60' },
  { id:'charges',      icon:'💰', label:'Share Charges',   color:'#2980B9' },
  { id:'bill',         icon:'🧾', label:'Bill Ready',      color:'#8E44AD' },
]

function buildMsg(id: string, name: string, extra: string) {
  const n = name || 'Patient'
  switch (id) {
    case 'delay':        return `🙏 *Dear ${n},*\nI am running approximately *${extra||'15'} minutes late* for today's visit. Will be there shortly. Sorry for the inconvenience.\n\n_— PhyGeo Home Physiotherapy_`
    case 'absent_today': return `🙏 *Dear ${n},*\nDue to *${extra||'an emergency'}*, I will *not be able to visit today*. Will reschedule soon.\n\n_— PhyGeo Home Physiotherapy_`
    case 'absent_tmrw':  return `🙏 *Dear ${n},*\nI will *not be available tomorrow*${extra?` due to *${extra}*`:''}. Will plan next visit soon.\n\n_— PhyGeo Home Physiotherapy_`
    case 'confirm':      return `✅ *Appointment Confirmed*\n\nDear *${n}*,\nYour session is confirmed for *today*.\n\nPlease ensure:\n• Patient is rested\n• Comfortable clothing\n• Exercise mat ready\n\n_— PhyGeo Home Physiotherapy_`
    case 'charges':      return `💼 *PhyGeo — Home Visit Charges*\n\nDear *${n}*,\n\n• Per Visit: ₹${extra||'500'}\n• Monthly Package: On request\n\nPayment: Cash / UPI accepted.\n\n_— PhyGeo Home Physiotherapy_`
    case 'bill':         return `🧾 *PhyGeo — Invoice Ready*\n\nDear *${n}*,\nYour invoice is ready.\n\n*Total Amount: ₹${extra||'0'}*\n\nPlease arrange payment at earliest convenience.\n\n_— PhyGeo Home Physiotherapy_`
    default: return ''
  }
}

export default function QuickComm() {
  const { patients }    = useDataStore()
  const location        = useLocation()
  const pre             = location.state?.patient
  const [sel, setSel]   = useState<string|null>(null)
  const [pid, setPid]   = useState(pre?.id || '')
  const [extra, setExtra] = useState('')
  const [showPrev, setShowPrev] = useState(false)

  const patient = patients.find(p => p.id === pid)
  const message = sel ? buildMsg(sel, patient?.fullName||'', extra) : ''

  function send() {
    if (!message) return
    const phone   = patient?.phone?.replace(/\D/g,'')
    const encoded = encodeURIComponent(message)
    window.open(phone ? `https://wa.me/91${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`, '_blank')
  }

  const needExtra = sel && ['delay','absent_today','absent_tmrw','charges','bill'].includes(sel)
  const extraLabel = sel === 'delay' ? 'Minutes late' : sel === 'charges' ? 'Per visit charge (₹)' : sel === 'bill' ? 'Bill amount (₹)' : 'Reason'
  const extraHint  = sel === 'delay' ? '15' : sel === 'charges' || sel === 'bill' ? '500' : 'e.g. Personal emergency'

  function contactDev() {
    const msg = encodeURIComponent('Hello, I am using PhyGeo app and need some help.')
    window.open(`https://wa.me/919228108454?text=${msg}`, '_blank')
  }

  return (
    <div style={{ padding:16 }}>
      <h2 style={{ fontSize:22, fontWeight:800, paddingTop:12, marginBottom:16 }}>Quick Messages</h2>

      {/* Template grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
        {TEMPLATES.map(t => (
          <button key={t.id} onClick={() => { setSel(t.id); setExtra(''); setShowPrev(false) }}
            style={{ padding:'16px 10px', borderRadius:14, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:8,
              border:      `2px solid ${sel===t.id ? t.color : 'var(--border)'}`,
              background:  sel===t.id ? t.color+'18' : '#fff',
              transition: 'all 0.15s' }}>
            <span style={{ fontSize:28 }}>{t.icon}</span>
            <span style={{ fontSize:12, fontWeight:600, color: sel===t.id ? t.color : 'var(--text)' }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Patient picker */}
      <label style={{ fontSize:13, fontWeight:600, color:'var(--text-muted)', marginBottom:6, display:'block' }}>Patient (optional)</label>
      <select value={pid} onChange={e => setPid(e.target.value)}
        style={{ width:'100%', padding:'13px 16px', borderRadius:12, border:'1px solid var(--border)', fontSize:15, background:'#fff', marginBottom:12 }}>
        <option value=''>— No specific patient —</option>
        {patients.filter(p=>p.isActive).map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
      </select>

      {/* Extra input */}
      {needExtra && (
        <>
          <label style={{ fontSize:13, fontWeight:600, color:'var(--text-muted)', marginBottom:6, display:'block' }}>{extraLabel}</label>
          <input value={extra} onChange={e => setExtra(e.target.value)} placeholder={extraHint}
            style={{ width:'100%', padding:'13px 16px', borderRadius:12, border:'1px solid var(--border)', fontSize:15, background:'#fff', marginBottom:12 }} />
        </>
      )}

      {/* Preview + Send */}
      {sel && (
        <>
          <button onClick={() => setShowPrev(p => !p)}
            style={{ width:'100%', height:48, borderRadius:12, background:'var(--teal-light)', color:'var(--teal)', fontWeight:700, fontSize:15, marginBottom:10, border:'1px solid var(--border)' }}>
            {showPrev ? '🙈 Hide Preview' : '👁️ Preview Message'}
          </button>

          {showPrev && (
            <div style={{ background:'#E8FFF0', borderRadius:16, padding:16, marginBottom:14, borderLeft:'4px solid #25D366', whiteSpace:'pre-wrap', fontSize:14, lineHeight:1.7 }}>
              {message}
            </div>
          )}

          <button onClick={send}
            style={{ width:'100%', height:56, borderRadius:14, background:'#25D366', color:'#fff', fontSize:17, fontWeight:700, boxShadow:'0 4px 14px rgba(37,211,102,0.3)' }}>
            💬 Send via WhatsApp
          </button>
        </>
      )}
      {/* Developer contact */}
      <div style={{ marginTop: 32, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, textAlign: 'center' }}>Need help with the app?</p>
        <button onClick={contactDev} style={{
          width: '100%', padding: '16px', borderRadius: 14,
          background: '#fff', border: '1.5px solid #25D366',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          cursor: 'pointer'
        }}>
          <span style={{ fontSize: 22 }}>💬</span>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#25D366' }}>Contact Developer</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>WhatsApp support</p>
          </div>
        </button>
      </div>
    </div>
  )
}