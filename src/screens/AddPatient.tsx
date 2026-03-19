import React, { useState } from 'react'
import { useDataStore } from '../store/dataStore'
import { useNavigate, useLocation } from 'react-router-dom'

function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
}
function tcHandler(k: string, setF: React.Dispatch<React.SetStateAction<any>>) {
  return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((x: any) => ({ ...x, [k]: toTitleCase(e.target.value) }))
}
function rawHandler(k: string, setF: React.Dispatch<React.SetStateAction<any>>) {
  return (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((x: any) => ({ ...x, [k]: e.target.value }))
}

const EMPTY = {
  fullName: '', age: '', phone: '', address: '',
  ailment: '', referredBy: '', chargePerVisit: '', medicalHistory: '',
}

export default function AddPatient() {
  const { addPatient, updatePatient } = useDataStore()
  const navigate  = useNavigate()
  const location  = useLocation()
  const existing  = location.state?.patient
  const [f, setF] = useState(existing
    ? { ...EMPTY, ...existing, age: String(existing.age), chargePerVisit: String(existing.chargePerVisit) }
    : EMPTY
  )

  function save() {
    if (!f.fullName.trim() || !f.ailment.trim())
      return alert('Name and Ailment are required')
    const data = {
      fullName: f.fullName, age: Number(f.age) || 0,
      phone: f.phone, address: f.address, ailment: f.ailment,
      referredBy: f.referredBy, chargePerVisit: Number(f.chargePerVisit) || 0,
      medicalHistory: f.medicalHistory, isActive: true,
    }
    if (existing) { updatePatient(existing.id, data) }
    else { addPatient(data) }
    navigate('/phyjio/patients')
  }

  // ── Shared styles ──
  const inp: React.CSSProperties = {
    width: '100%', padding: '14px 16px',
    borderRadius: 14, border: '1.5px solid var(--border)',
    fontSize: 17, background: 'var(--surface)',
    color: 'var(--text)', marginBottom: 12,
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }
  const lbl: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: 'var(--text-muted)',
    marginBottom: 6, display: 'block', letterSpacing: 0.2,
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100%', paddingBottom: 40 }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '56px 20px 16px',
        background: 'var(--surface)',
        borderBottom: '0.5px solid var(--separator)',
        marginBottom: 24,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 36, height: 36, borderRadius: 18,
            background: 'rgba(118,118,128,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, color: 'var(--brand)', fontWeight: 700,
          }}>‹</button>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.3 }}>
          {existing ? 'Edit Patient' : 'Add Patient'}
        </h1>
      </div>

      <div style={{ padding: '0 20px' }}>

        {/* ── Section: Identity ── */}
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
          Patient Info
        </p>
        <div style={{ background: 'var(--surface)', borderRadius: 24, padding: '20px 18px', boxShadow: 'var(--shadow)', marginBottom: 20 }}>
          <label style={lbl}>Full Name *</label>
          <input style={inp} value={f.fullName} onChange={tcHandler('fullName', setF)} placeholder="e.g. Ramesh Patel" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Age</label>
              <input style={{ ...inp, marginBottom: 0 }} type="number" value={f.age} onChange={rawHandler('age', setF)} placeholder="35" />
            </div>
            <div>
              <label style={lbl}>Phone</label>
              <input style={{ ...inp, marginBottom: 0 }} type="tel" value={f.phone} onChange={rawHandler('phone', setF)} placeholder="98765 43210" />
            </div>
          </div>
        </div>

        {/* ── Section: Clinical ── */}
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
          Clinical Details
        </p>
        <div style={{ background: 'var(--surface)', borderRadius: 24, padding: '20px 18px', boxShadow: 'var(--shadow)', marginBottom: 20 }}>
          <label style={lbl}>Ailment / Condition *</label>
          <input style={inp} value={f.ailment} onChange={tcHandler('ailment', setF)} placeholder="e.g. Knee Osteoarthritis" />

          <label style={lbl}>Referred By</label>
          <input style={inp} value={f.referredBy} onChange={tcHandler('referredBy', setF)} placeholder="Dr. Sharma / Self" />

          <label style={lbl}>Medical History / Notes</label>
          <textarea
            style={{ ...inp, minHeight: 90, resize: 'vertical' }}
            value={f.medicalHistory}
            onChange={tcHandler('medicalHistory', setF)}
            placeholder="Diabetes, Hypertension, Previous surgeries…"
          />

          <label style={{ ...lbl, marginTop: 4 }}>Address</label>
          <input style={{ ...inp, marginBottom: 0 }} value={f.address} onChange={tcHandler('address', setF)} placeholder="House No, Street, Area" />
        </div>

        {/* ── Section: Billing ── */}
        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>
          Billing
        </p>
        <div style={{ background: 'var(--surface)', borderRadius: 24, padding: '20px 18px', boxShadow: 'var(--shadow)', marginBottom: 28 }}>
          <label style={lbl}>Charge Per Visit (₹)</label>
          <input
            style={{ ...inp, marginBottom: 0, fontSize: 20, fontWeight: 700 }}
            type="number" value={f.chargePerVisit}
            onChange={rawHandler('chargePerVisit', setF)}
            placeholder="500"
          />
        </div>

        {/* ── Save CTA ── */}
        <button
          onClick={save}
          style={{
            width: '100%', height: 58, borderRadius: 20,
            background: 'var(--ig-gradient)',
            color: '#fff', fontSize: 17, fontWeight: 700,
            boxShadow: '0 6px 20px rgba(221,42,123,0.35)',
            letterSpacing: 0.2,
          }}>
          {existing ? '✓ Save Changes' : '✅ Add Patient'}
        </button>

      </div>
    </div>
  )
}
