import React, { useState, useEffect, useRef } from 'react'
import { useDataStore } from '../store/dataStore'
import { imageStore, compressImage } from '../store/imageStore'

type Tab = 'reports' | 'progression' | 'payments'

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function toInputDate(ts: number) {
  return new Date(ts).toISOString().split('T')[0]
}

// ── Image Card ──────────────────────────────────────────────
function RecordCard({ record, onDelete }: { record: { id: string; date: number; notes: string }; onDelete: () => void }) {
  const [src, setSrc] = useState<string | undefined>()

  useEffect(() => {
    imageStore.load(record.id).then(setSrc)
  }, [record.id])

  return (
    <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
      {src
        ? <img src={src} alt="record" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
        : <div style={{ width: '100%', aspectRatio: '4/3', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🖼️</div>
      }
      <div style={{ padding: '10px 12px' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(record.date)}</p>
        {record.notes && <p style={{ fontSize: 13, color: 'var(--text)', marginTop: 2 }}>{record.notes}</p>}
        <button onClick={onDelete} style={{ marginTop: 8, fontSize: 12, color: '#E74C3C', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>🗑 Delete</button>
      </div>
    </div>
  )
}

// ── Main Screen ─────────────────────────────────────────────
export default function RecordsScreen() {
  const { patients, visits, records, payments, addRecord, deleteRecord, addPayment, deletePayment } = useDataStore()

  const [pid,     setPid]     = useState('')
  const [tab,     setTab]     = useState<Tab>('reports')
  const [adding,  setAdding]  = useState(false)
  const [notes,   setNotes]   = useState('')
  const [recDate, setRecDate] = useState(toInputDate(Date.now()))
  const [saving,  setSaving]  = useState(false)
  const [imgFile, setImgFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')

  // Payment form
  const [payAmt,    setPayAmt]    = useState('')
  const [payDate,   setPayDate]   = useState(toInputDate(Date.now()))
  const [payMethod, setPayMethod] = useState<'cash' | 'upi' | 'other'>('cash')
  const [payNote,   setPayNote]   = useState('')
  const [addingPay, setAddingPay] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const activePatients = patients.filter(p => p.isActive)
  const patient = patients.find(p => p.id === pid)

  const patRecords  = records.filter(r => r.patientId === pid && r.type === (tab === 'reports' ? 'report' : 'progression'))
  const patPayments = payments.filter(p => p.patientId === pid).sort((a, b) => b.date - a.date)

  // Payment summary
  const completedVisits = visits.filter(v => v.patientId === pid && v.status === 'completed')
  const totalDue  = completedVisits.reduce((s, v) => s + v.charge, 0)
  const totalPaid = patPayments.reduce((s, p) => s + p.amount, 0)
  const balance   = totalDue - totalPaid

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setImgFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function saveRecord() {
    if (!imgFile || !pid) return
    setSaving(true)
    const dataUrl = await compressImage(imgFile)
    const id = addRecord({ patientId: pid, type: tab === 'reports' ? 'report' : 'progression', date: new Date(recDate).getTime(), notes })
    await imageStore.save(id, dataUrl)
    setAdding(false); setNotes(''); setImgFile(null); setPreview(''); setSaving(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleDeleteRecord(id: string) {
    await imageStore.remove(id)
    deleteRecord(id)
  }

  function savePayment() {
    if (!payAmt || !pid) return
    addPayment({ patientId: pid, amount: Number(payAmt), date: new Date(payDate).getTime(), method: payMethod, note: payNote })
    setPayAmt(''); setPayNote(''); setAddingPay(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)',
    fontSize: 14, background: '#fff', boxSizing: 'border-box', marginBottom: 10, outline: 'none'
  }

  return (
    <div style={{ padding: 16, paddingBottom: 90 }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, paddingTop: 12, marginBottom: 16 }}>Patient Records</h2>

      {/* Patient picker */}
      <select value={pid} onChange={e => { setPid(e.target.value); setAdding(false); setAddingPay(false) }}
        style={{ ...inputStyle, marginBottom: 20, fontWeight: pid ? 600 : 400 }}>
        <option value=''>— Select Patient —</option>
        {activePatients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
      </select>

      {!pid && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
          <p>Select a patient to view records</p>
        </div>
      )}

      {pid && (
        <>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(['reports', 'progression', 'payments'] as Tab[]).map(t => (
              <button key={t} onClick={() => { setTab(t); setAdding(false); setAddingPay(false) }}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  background: tab === t ? 'var(--teal)' : '#f0f0f0',
                  color: tab === t ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.15s'
                }}>
                {t === 'reports' ? '📄 Reports' : t === 'progression' ? '📈 Progress' : '💰 Payments'}
              </button>
            ))}
          </div>

          {/* ── REPORTS / PROGRESSION ── */}
          {(tab === 'reports' || tab === 'progression') && (
            <>
              {/* Add button */}
              {!adding && (
                <button onClick={() => setAdding(true)} style={{
                  width: '100%', padding: 14, borderRadius: 14, border: '2px dashed var(--teal)',
                  background: 'var(--teal-light)', color: 'var(--teal)', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 16
                }}>
                  + Add {tab === 'reports' ? 'Report' : 'Progression'} Image
                </button>
              )}

              {/* Add form */}
              {adding && (
                <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: 'var(--shadow)', marginBottom: 16 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
                    New {tab === 'reports' ? 'Report' : 'Progression'} Image
                  </p>

                  {/* Image picker */}
                  <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFileChange}
                    style={{ display: 'none' }} />
                  <button onClick={() => fileRef.current?.click()} style={{
                    width: '100%', height: 120, borderRadius: 12, border: '2px dashed #ddd',
                    background: '#fafafa', cursor: 'pointer', overflow: 'hidden', marginBottom: 10, padding: 0
                  }}>
                    {preview
                      ? <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                          <span style={{ fontSize: 28 }}>📷</span>
                          <span style={{ fontSize: 12, marginTop: 4 }}>Tap to select image</span>
                        </div>
                    }
                  </button>

                  <input type="date" value={recDate} onChange={e => setRecDate(e.target.value)} style={inputStyle} />
                  <input placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} style={inputStyle} />

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setAdding(false); setPreview(''); setImgFile(null) }}
                      style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid var(--border)', background: '#fff', cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button onClick={saveRecord} disabled={!imgFile || saving}
                      style={{ flex: 2, padding: 12, borderRadius: 12, border: 'none', background: 'var(--teal)', color: '#fff', fontWeight: 700, cursor: imgFile ? 'pointer' : 'not-allowed', opacity: imgFile ? 1 : 0.5 }}>
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </div>
              )}

              {/* Records grid */}
              {patRecords.length === 0 && !adding && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontSize: 14 }}>
                  No {tab === 'reports' ? 'reports' : 'progression images'} yet
                </p>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[...patRecords].sort((a, b) => b.date - a.date).map(r => (
                  <RecordCard key={r.id} record={r} onDelete={() => handleDeleteRecord(r.id)} />
                ))}
              </div>
            </>
          )}

          {/* ── PAYMENTS ── */}
          {tab === 'payments' && (
            <>
              {/* Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                {[
                  { label: 'Total Due',  value: `₹${totalDue}`,  color: '#E74C3C' },
                  { label: 'Paid',       value: `₹${totalPaid}`, color: '#27AE60' },
                  { label: 'Balance',    value: `₹${balance}`,   color: balance > 0 ? '#E74C3C' : '#27AE60' },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '12px 10px', boxShadow: 'var(--shadow)', textAlign: 'center' }}>
                    <p style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Add payment */}
              {!addingPay && (
                <button onClick={() => setAddingPay(true)} style={{
                  width: '100%', padding: 14, borderRadius: 14, border: '2px dashed var(--teal)',
                  background: 'var(--teal-light)', color: 'var(--teal)', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 16
                }}>
                  + Add Payment
                </button>
              )}

              {addingPay && (
                <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: 'var(--shadow)', marginBottom: 16 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Record Payment</p>
                  <input type="number" placeholder="Amount (₹)" value={payAmt} onChange={e => setPayAmt(e.target.value)} style={inputStyle} />
                  <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} style={inputStyle} />
                  <select value={payMethod} onChange={e => setPayMethod(e.target.value as 'cash' | 'upi' | 'other')} style={inputStyle}>
                    <option value="cash">💵 Cash</option>
                    <option value="upi">📱 UPI</option>
                    <option value="other">🏦 Other</option>
                  </select>
                  <input placeholder="Note (optional)" value={payNote} onChange={e => setPayNote(e.target.value)} style={inputStyle} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setAddingPay(false)}
                      style={{ flex: 1, padding: 12, borderRadius: 12, border: '1px solid var(--border)', background: '#fff', cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button onClick={savePayment} disabled={!payAmt}
                      style={{ flex: 2, padding: 12, borderRadius: 12, border: 'none', background: 'var(--teal)', color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: payAmt ? 1 : 0.5 }}>
                      Save Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Payment list */}
              {patPayments.length === 0 && !addingPay && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontSize: 14 }}>No payments recorded yet</p>
              )}
              {patPayments.map(p => (
                <div key={p.id} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', boxShadow: 'var(--shadow)', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 16, color: '#27AE60' }}>₹{p.amount}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {p.method === 'cash' ? '💵' : p.method === 'upi' ? '📱' : '🏦'} {p.method.toUpperCase()} · {formatDate(p.date)}
                    </p>
                    {p.note && <p style={{ fontSize: 12, color: 'var(--text)', marginTop: 2 }}>{p.note}</p>}
                  </div>
                  <button onClick={() => deletePayment(p.id)} style={{ background: 'none', border: 'none', color: '#E74C3C', fontSize: 18, cursor: 'pointer' }}>🗑</button>
                </div>
              ))}
            </>
          )}
        </>
      )}

      {/* Developer contact — small */}
      <div style={{ marginTop: 40, textAlign: 'center' }}>
        <button onClick={() => window.open('https://wa.me/919228108454?text=' + encodeURIComponent('Hello, I need help with PhyJio app.'), '_blank')}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          💬 Contact Developer
        </button>
      </div>
    </div>
  )
}
