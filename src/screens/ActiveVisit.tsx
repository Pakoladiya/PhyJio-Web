import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDataStore } from '../store/dataStore'

export default function ActiveVisit() {
  const { patientId } = useParams()
  const navigate      = useNavigate()
  const { patients, visits, addVisit, updateVisit } = useDataStore()
  const patient    = patients.find(p => p.id === patientId)
  const [secs, setSecs]   = useState(0)
  const [notes, setNotes] = useState('')
  const visitId     = useRef<string | null>(null)
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    visits.filter(v => v.patientId === patientId && v.status === 'active')
          .forEach(v => updateVisit(v.id, { status: 'cancelled' }))
    const v = addVisit({
      patientId: patientId!, startTime: Date.now(),
      status: 'active', charge: patient?.chargePerVisit || 0,
      isPaid: false, notes: '',
    })
    visitId.current = v.id
    timerRef.current = setInterval(() => setSecs(s => s + 1), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60

  function endVisit() {
    if (!window.confirm('End and save this visit?')) return
    if (timerRef.current) clearInterval(timerRef.current)
    if (visitId.current) {
      updateVisit(visitId.current, {
        endTime: Date.now(), durationMin: Math.max(1, Math.round(secs / 60)),
        status: 'completed', notes,
      })
    }
    navigate(`/phyjio/patients/${patientId}`, { replace: true })
  }

  function cancelVisit() {
    if (!window.confirm('Cancel this visit?')) return
    if (timerRef.current) clearInterval(timerRef.current)
    if (visitId.current) updateVisit(visitId.current, { status: 'cancelled' })
    navigate(-1)
  }

  if (!patient) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Patient not found</div>

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100%' }}>

      {/* ── Gradient Patient Header ── */}
      <div style={{
        background: 'var(--ig-gradient)',
        padding: '56px 20px 28px',
        borderRadius: '0 0 32px 32px',
        marginBottom: 24,
      }}>
        <p style={{ color: 'rgba(255,255,255,0.70)', fontSize: 14, marginBottom: 4, fontWeight: 500 }}>
          Active Visit
        </p>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: -0.3, marginBottom: 4 }}>
          {patient.fullName}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 15 }}>{patient.ailment}</p>
        <p style={{ color: 'rgba(255,255,255,0.60)', fontSize: 13, marginTop: 4 }}>
          ₹{patient.chargePerVisit} per visit
        </p>
      </div>

      <div style={{ padding: '0 20px 40px' }}>

        {/* ── Timer ── */}
        <div style={{
          background: 'var(--surface)', borderRadius: 28,
          padding: '36px 24px', textAlign: 'center',
          marginBottom: 20, boxShadow: 'var(--shadow-md)',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>
            Session Duration
          </p>
          <p style={{
            fontSize: 72, fontWeight: 800, color: 'var(--brand)',
            fontVariantNumeric: 'tabular-nums', letterSpacing: 2, lineHeight: 1,
          }}>
            {pad(h)}:{pad(m)}:{pad(s)}
          </p>
        </div>

        {/* ── Notes ── */}
        <div style={{
          background: 'var(--surface)', borderRadius: 24,
          padding: '18px 18px 4px', marginBottom: 24, boxShadow: 'var(--shadow)',
        }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Session Notes
          </p>
          <textarea
            value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Exercises done, patient response, progress notes…"
            style={{
              width: '100%', minHeight: 110, padding: '0 0 16px',
              border: 'none', fontSize: 16, color: 'var(--text)',
              background: 'transparent', resize: 'vertical', lineHeight: 1.5,
            }}
          />
        </div>

        {/* ── Actions ── */}
        <button onClick={endVisit}
          style={{
            width: '100%', height: 58, borderRadius: 20,
            background: 'var(--ig-gradient)',
            color: '#fff', fontSize: 17, fontWeight: 700,
            marginBottom: 12,
            boxShadow: '0 6px 20px rgba(221,42,123,0.35)',
          }}>
          ✅ End & Save Visit
        </button>

        <button onClick={cancelVisit}
          style={{
            width: '100%', height: 50, borderRadius: 20,
            background: 'rgba(255,59,48,0.08)',
            border: '1px solid rgba(255,59,48,0.22)',
            color: 'var(--danger)', fontSize: 15, fontWeight: 600,
          }}>
          ✕ Cancel Visit
        </button>

      </div>
    </div>
  )
}
