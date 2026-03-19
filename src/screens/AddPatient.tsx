import React, { useState } from 'react'
import { useDataStore } from '../store/dataStore'
import { useNavigate } from 'react-router-dom'

// ✅ Converts any string to Title Case
function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (word) =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  )
}

// ✅ Handler — applies title case only on text fields
function titleCaseHandler(
  k: string,
  setF: React.Dispatch<React.SetStateAction<any>>
) {
  return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value
    setF((x: any) => ({ ...x, [k]: toTitleCase(val) }))
  }
}

// ✅ Raw handler — for number/phone fields (no title case)
function rawHandler(
  k: string,
  setF: React.Dispatch<React.SetStateAction<any>>
) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    setF((x: any) => ({ ...x, [k]: e.target.value }))
  }
}

export default function AddPatient() {
  const { addPatient } = useDataStore()
  const navigate = useNavigate()
  const [f, setF] = useState({
    fullName: '', age: '', phone: '', address: '',
    ailment: '', referredBy: '', chargePerVisit: '', medicalHistory: ''
  })

  function save() {
    if (!f.fullName.trim() || !f.ailment.trim())
      return alert('Name and Ailment are required')
    addPatient({
      fullName:       f.fullName,
      age:            Number(f.age) || 0,
      phone:          f.phone,
      address:        f.address,
      ailment:        f.ailment,
      referredBy:     f.referredBy,
      chargePerVisit: Number(f.chargePerVisit) || 0,
      medicalHistory: f.medicalHistory,
      isActive:       true
    })
    navigate('/phyjio/patients')
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '13px 16px', borderRadius: 12,
    border: '1px solid var(--border)', fontSize: 15,
    background: '#fff', marginBottom: 12
  }
  const lbl: React.CSSProperties = {
    fontSize: 13, fontWeight: 600,
    color: 'var(--text-muted)', marginBottom: 4, display: 'block'
  }

  return (
    <div style={{ padding: 16, paddingBottom: 100 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 12, marginBottom: 20 }}>
        <button onClick={() => navigate(-1)}
          style={{ fontSize: 28, color: 'var(--teal)', lineHeight: 1 }}>‹</button>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>Add New Patient</h2>
      </div>

      {/* Full Name — title case ✅ */}
      <label style={lbl}>Full Name *</label>
      <input
        style={inp}
        value={f.fullName}
        onChange={titleCaseHandler('fullName', setF)}
        placeholder="E.g. Ramesh Patel"
      />

      {/* Age + Phone — raw (no title case) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={lbl}>Age</label>
          <input
            style={{ ...inp, marginBottom: 0 }}
            type="number"
            value={f.age}
            onChange={rawHandler('age', setF)}
            placeholder="35"
          />
        </div>
        <div>
          <label style={lbl}>Phone</label>
          <input
            style={{ ...inp, marginBottom: 0 }}
            type="tel"
            value={f.phone}
            onChange={rawHandler('phone', setF)}
            placeholder="98765 43210"
          />
        </div>
      </div>

      {/* Address — title case ✅ */}
      <label style={lbl}>Address</label>
      <input
        style={inp}
        value={f.address}
        onChange={titleCaseHandler('address', setF)}
        placeholder="House No, Street, Area"
      />

      {/* Ailment — title case ✅ */}
      <label style={lbl}>Ailment / Condition *</label>
      <input
        style={inp}
        value={f.ailment}
        onChange={titleCaseHandler('ailment', setF)}
        placeholder="E.g. Knee Osteoarthritis"
      />

      {/* Referred By — title case ✅ */}
      <label style={lbl}>Referred By</label>
      <input
        style={inp}
        value={f.referredBy}
        onChange={titleCaseHandler('referredBy', setF)}
        placeholder="Dr. Sharma / Self"
      />

      {/* Charge Per Visit — raw (number) */}
      <label style={lbl}>Charge Per Visit (₹)</label>
      <input
        style={inp}
        type="number"
        value={f.chargePerVisit}
        onChange={rawHandler('chargePerVisit', setF)}
        placeholder="500"
      />

      {/* Medical History — title case ✅ */}
      <label style={lbl}>Medical History / Notes</label>
      <textarea
        style={{ ...inp, minHeight: 100, resize: 'vertical' }}
        value={f.medicalHistory}
        onChange={titleCaseHandler('medicalHistory', setF)}
        placeholder="Diabetes, Hypertension, Previous Surgeries..."
      />

      {/* Save button */}
      <button onClick={save}
        style={{
          width: '100%', height: 56, borderRadius: 14,
          background: 'var(--ig-gradient)',
          color: '#fff', fontSize: 17, fontWeight: 700,
          marginTop: 8, boxShadow: '0 4px 14px rgba(221,42,123,0.3)'
        }}>
        ✅ Save Patient
      </button>

    </div>
  )
}