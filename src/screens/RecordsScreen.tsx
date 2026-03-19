import React, { useState, useEffect, useRef } from 'react'
import { useDataStore } from '../store/dataStore'
import { imageStore, compressImage } from '../store/imageStore'

type Tab = 'reports' | 'progression' | 'payments'

function fmt(ts: number) {
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
function toInputDate(ts: number) {
  return new Date(ts).toISOString().split('T')[0]
}

// ── Image Card ──────────────────────────────────────────────
function RecordCard({ record, onDelete }: { record: { id: string; date: number; notes: string }; onDelete: () => void }) {
  const [src, setSrc] = useState<string | undefined>()
  useEffect(() => { imageStore.load(record.id).then(setSrc) }, [record.id])

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
      {src
        ? <img src={src} alt="record" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
        : <div style={{ width: '100%', aspectRatio: '4/3', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🖼️</div>
      }
      <div style={{ padding: '12px 14px' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{fmt(record.date)}</p>
        {record.notes && <p style={{ fontSize: 14, color: 'var(--text)', marginTop: 4, lineHeight: 1.4 }}>{record.notes}</p>}
        <button onClick={onDelete} style={{ marginTop: 10, fontSize: 12, color: 'var(--danger)', fontWeight: 600 }}>
          🗑 Delete
        </button>
      </div>
    </div>
  )
}

// ── Main Screen ─────────────────────────────────────────────
export default function RecordsScreen() {
  const { patients, visits, records, payments, addRecord, deleteRecord, addPayment, deletePayment } = useDataStore()

  const [pid,      setPid]      = useState('')
  const [tab,      setTab]      = useState<Tab>('reports')
  const [adding,   setAdding]   = useState(false)
  const [notes,    setNotes]    = useState('')
  const [recDate,  setRecDate]  = useState(toInputDate(Date.now()))
  const [saving,   setSaving]   = useState(false)
  const [imgFile,  setImgFile]  = useState<File | null>(null)
  const [preview,  setPreview]  = useState('')
  const [payAmt,   setPayAmt]   = useState('')
  const [payDate,  setPayDate]  = useState(toInputDate(Date.now()))
  const [payMethod,setPayMethod]= useState<'cash'|'upi'|'other'>('cash')
  const [payNote,  setPayNote]  = useState('')
  const [addingPay,setAddingPay]= useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const activePatients = patients.filter(p => p.isActive)
  const patient        = patients.find(p => p.id === pid)
  const patRecords     = records.filter(r => r.patientId === pid && r.type === (tab === 'reports' ? 'report' : 'progression'))
  const patPayments    = payments.filter(p => p.patientId === pid).sort((a, b) => b.date - a.date)
  const completedVisits = visits.filter(v => v.patientId === pid && v.status === 'completed')
  const totalDue       = completedVisits.reduce((s, v) => s + v.charge, 0)
  const totalPaid      = patPayments.reduce((s, p) => s + p.amount, 0)
  const balance        = totalDue - totalPaid

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setImgFile(f); setPreview(URL.createObjectURL(f))
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
    await imageStore.remove(id); deleteRecord(id)
  }
  function savePayment() {
    if (!payAmt || !pid) return
    addPayment({ patientId: pid, amount: Number(payAmt), date: new Date(payDate).getTime(), method: payMethod, note: payNote })
    setPayAmt(''); setPayNote(''); setAddingPay(false)
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 14,
    border: '1.5px solid var(--border)', fontSize: 16,
    background: 'var(--surface)', marginBottom: 10,
    color: 'var(--text)', boxSizing: 'border-box',
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100%', paddingBottom: 100 }}>

      {/* ── Header ── */}
      <div style={{ padding: '56px 20px 20px', background: 'var(--surface)', borderBottom: '0.5px solid var(--separator)', marginBottom: 24 }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: -0.5 }}>Records</h1>
      </div>

      <div style={{ padding: '0 20px' }}>

        {/* Patient selector */}
        <div style={{
          background: 'var(--surface)', borderRadius: 18,
          padding: '4px 16px', boxShadow: 'var(--shadow)', marginBottom: 20,
          position: 'relative',
        }}>
          <select
            value={pid}
            onChange={e => { setPid(e.target.value); setAdding(false); setAddingPay(false) }}
            style={{
              width: '100%', padding: '16px 0', fontSize: 17,
              background: 'transparent', border: 'none', outline: 'none',
              cursor: 'pointer', color: pid ? 'var(--text)' : 'var(--text-muted)',
            }}>
            <option value=''>— Select Patient —</option>
            {activePatients.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
          </select>
          <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>⌄</span>
        </div>

        {!pid && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 52, marginBottom: 16 }}>📂</p>
            <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-secondary)' }}>No patient selected</p>
            <p style={{ fontSize: 14, marginTop: 6 }}>Choose a patient to view their records</p>
          </div>
        )}

        {pid && (
          <>
            {/* Tabs */}
            <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: 18, padding: 4, marginBottom: 20, boxShadow: 'var(--shadow-sm)' }}>
              {(['reports','progression','payments'] as Tab[]).map(t => (
                <button key={t} onClick={() => { setTab(t); setAdding(false); setAddingPay(false) }}
                  style={{
                    flex: 1, padding: '10px 4px', borderRadius: 14, fontSize: 12, fontWeight: 700,
                    background: tab === t ? 'var(--brand)' : 'transparent',
                    color: tab === t ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.2s ease',
                    boxShadow: tab === t ? '0 3px 10px rgba(221,42,123,0.28)' : 'none',
                  }}>
                  {t === 'reports' ? '📄 Reports' : t === 'progression' ? '📈 Progress' : '💰 Payments'}
                </button>
              ))}
            </div>

            {/* ── Reports / Progression ── */}
            {(tab === 'reports' || tab === 'progression') && (
              <>
                {!adding && (
                  <button onClick={() => setAdding(true)} style={{
                    width: '100%', padding: 16, borderRadius: 18,
                    border: '2px dashed rgba(221,42,123,0.35)',
                    background: 'rgba(221,42,123,0.05)',
                    color: 'var(--brand)', fontWeight: 700, fontSize: 15,
                    marginBottom: 16,
                  }}>
                    + Add {tab === 'reports' ? 'Report' : 'Progress'} Image
                  </button>
                )}
                {adding && (
                  <div style={{ background: 'var(--surface)', borderRadius: 22, padding: 18, boxShadow: 'var(--shadow)', marginBottom: 16 }}>
                    <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>
                      New {tab === 'reports' ? 'Report' : 'Progress'} Image
                    </p>
                    <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onFileChange} style={{ display: 'none' }} />
                    <button onClick={() => fileRef.current?.click()} style={{
                      width: '100%', height: 130, borderRadius: 16, border: '2px dashed var(--border)',
                      background: '#fafafa', cursor: 'pointer', overflow: 'hidden', marginBottom: 10, padding: 0,
                    }}>
                      {preview
                        ? <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: 8 }}>
                            <span style={{ fontSize: 32 }}>📷</span>
                            <span style={{ fontSize: 13 }}>Tap to choose image</span>
                          </div>
                      }
                    </button>
                    <input type="date" value={recDate} onChange={e => setRecDate(e.target.value)} style={inp} />
                    <input placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} style={inp} />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => { setAdding(false); setPreview(''); setImgFile(null) }}
                        style={{ flex: 1, padding: 14, borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 15 }}>
                        Cancel
                      </button>
                      <button onClick={saveRecord} disabled={!imgFile || saving}
                        style={{ flex: 2, padding: 14, borderRadius: 14, background: 'var(--ig-gradient)', color: '#fff', fontWeight: 700, fontSize: 15, opacity: imgFile ? 1 : 0.45 }}>
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  </div>
                )}
                {patRecords.length === 0 && !adding && (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0', fontSize: 15 }}>
                    No {tab === 'reports' ? 'reports' : 'progress images'} yet
                  </p>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[...patRecords].sort((a, b) => b.date - a.date).map(r => (
                    <RecordCard key={r.id} record={r} onDelete={() => handleDeleteRecord(r.id)} />
                  ))}
                </div>
              </>
            )}

            {/* ── Payments ── */}
            {tab === 'payments' && (
              <>
                {/* Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
                  {[
                    { label: 'Total Due', value: `₹${totalDue}`,  color: '#FF3B30' },
                    { label: 'Paid',      value: `₹${totalPaid}`, color: '#34C759' },
                    { label: 'Balance',   value: `₹${balance}`,   color: balance > 0 ? '#FF3B30' : '#34C759' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'var(--surface)', borderRadius: 18, padding: '14px 10px', boxShadow: 'var(--shadow)', textAlign: 'center' }}>
                      <p style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {!addingPay && (
                  <button onClick={() => setAddingPay(true)} style={{
                    width: '100%', padding: 16, borderRadius: 18,
                    border: '2px dashed rgba(221,42,123,0.35)',
                    background: 'rgba(221,42,123,0.05)',
                    color: 'var(--brand)', fontWeight: 700, fontSize: 15, marginBottom: 16,
                  }}>
                    + Record Payment
                  </button>
                )}

                {addingPay && (
                  <div style={{ background: 'var(--surface)', borderRadius: 22, padding: 18, boxShadow: 'var(--shadow)', marginBottom: 16 }}>
                    <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Record Payment</p>
                    <input type="number" placeholder="Amount (₹)" value={payAmt} onChange={e => setPayAmt(e.target.value)} style={inp} />
                    <input type="date" value={payDate} onChange={e => setPayDate(e.target.value)} style={inp} />
                    <select value={payMethod} onChange={e => setPayMethod(e.target.value as any)}
                      style={{ ...inp, cursor: 'pointer' }}>
                      <option value="cash">💵 Cash</option>
                      <option value="upi">📱 UPI</option>
                      <option value="other">🏦 Other</option>
                    </select>
                    <input placeholder="Note (optional)" value={payNote} onChange={e => setPayNote(e.target.value)} style={inp} />
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => setAddingPay(false)}
                        style={{ flex: 1, padding: 14, borderRadius: 14, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 15 }}>
                        Cancel
                      </button>
                      <button onClick={savePayment} disabled={!payAmt}
                        style={{ flex: 2, padding: 14, borderRadius: 14, background: 'var(--ig-gradient)', color: '#fff', fontWeight: 700, fontSize: 15, opacity: payAmt ? 1 : 0.45 }}>
                        Save Payment
                      </button>
                    </div>
                  </div>
                )}

                {patPayments.length === 0 && !addingPay && (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0', fontSize: 15 }}>No payments recorded yet</p>
                )}
                {patPayments.map(p => (
                  <div key={p.id} style={{
                    background: 'var(--surface)', borderRadius: 20, padding: '16px 18px',
                    boxShadow: 'var(--shadow)', marginBottom: 10,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 20, color: '#34C759' }}>₹{p.amount}</p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
                        {p.method === 'cash' ? '💵' : p.method === 'upi' ? '📱' : '🏦'} {p.method.toUpperCase()} · {fmt(p.date)}
                      </p>
                      {p.note && <p style={{ fontSize: 13, color: 'var(--text)', marginTop: 3 }}>{p.note}</p>}
                    </div>
                    <button onClick={() => deletePayment(p.id)} style={{ fontSize: 20, color: 'var(--danger)', padding: 4 }}>🗑</button>
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {/* Developer contact */}
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <button
            onClick={() => window.open('https://wa.me/919228108454?text=' + encodeURIComponent('Hello, I need help with PhyJio app.'), '_blank')}
            style={{ color: 'var(--text-muted)', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
            💬 Contact Developer
          </button>
        </div>

      </div>
    </div>
  )
}
