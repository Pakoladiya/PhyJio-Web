import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
export default function ActiveVisit() {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const { patients, visits, addVisit, updateVisit } = useDataStore();
    const patient = patients.find(p => p.id === patientId);
    const [secs, setSecs] = useState(0);
    const [notes, setNotes] = useState('');
    const visitId = useRef(null);
    const timerRef = useRef(null);
    const initialized = useRef(false); // ✅ Guard — prevents double run in StrictMode
    useEffect(() => {
        if (initialized.current)
            return; // ✅ Skip if already ran
        initialized.current = true;
        // ✅ Cancel any existing stuck active visits for this patient
        const stuckVisits = visits.filter(v => v.patientId === patientId && v.status === 'active');
        stuckVisits.forEach(v => updateVisit(v.id, { status: 'cancelled' }));
        // ✅ Create ONE fresh active visit
        const v = addVisit({
            patientId: patientId,
            startTime: Date.now(),
            status: 'active',
            charge: patient?.chargePerVisit || 0,
            isPaid: false,
            notes: ''
        });
        visitId.current = v.id;
        // ✅ Start timer
        timerRef.current = setInterval(() => setSecs(s => s + 1), 1000);
        return () => {
            if (timerRef.current)
                clearInterval(timerRef.current);
        };
    }, []);
    const pad = (n) => String(n).padStart(2, '0');
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    function endVisit() {
        if (!window.confirm('End and save this visit?'))
            return;
        if (timerRef.current)
            clearInterval(timerRef.current);
        if (visitId.current) {
            updateVisit(visitId.current, {
                endTime: Date.now(),
                durationMin: Math.max(1, Math.round(secs / 60)),
                status: 'completed',
                notes
            });
        }
        navigate(`/phyjio/patients/${patientId}`, { replace: true });
    }
    function cancelVisit() {
        if (!window.confirm('Cancel this visit?'))
            return;
        if (timerRef.current)
            clearInterval(timerRef.current);
        if (visitId.current) {
            updateVisit(visitId.current, { status: 'cancelled' });
        }
        navigate(-1);
    }
    if (!patient)
        return _jsx("div", { style: { padding: 32 }, children: "Patient not found" });
    return (_jsxs("div", { style: { padding: 16, minHeight: '100vh' }, children: [_jsx("h2", { style: { fontSize: 20, fontWeight: 800, paddingTop: 12, marginBottom: 20 }, children: "Active Visit \u25B6" }), _jsxs("div", { style: { background: 'var(--teal)', borderRadius: 16, padding: 20, marginBottom: 24, color: '#fff' }, children: [_jsx("p", { style: { opacity: 0.8, fontSize: 13 }, children: "Visiting" }), _jsx("h3", { style: { fontSize: 22, fontWeight: 800 }, children: patient.fullName }), _jsx("p", { style: { opacity: 0.85 }, children: patient.ailment }), _jsxs("p", { style: { opacity: 0.75, fontSize: 13, marginTop: 4 }, children: ["\u20B9", patient.chargePerVisit, " per visit"] })] }), _jsxs("div", { style: { background: '#fff', borderRadius: 20, padding: 32, textAlign: 'center', marginBottom: 24, boxShadow: 'var(--shadow)' }, children: [_jsx("p", { style: { color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }, children: "Session Duration" }), _jsxs("p", { style: { fontSize: 60, fontWeight: 800, color: 'var(--teal)', fontVariantNumeric: 'tabular-nums', letterSpacing: 3 }, children: [pad(h), ":", pad(m), ":", pad(s)] })] }), _jsx("label", { style: { fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }, children: "Session Notes" }), _jsx("textarea", { value: notes, onChange: e => setNotes(e.target.value), placeholder: "Exercises done, patient response, progress notes...", style: { width: '100%', minHeight: 120, padding: '14px 16px', borderRadius: 14, border: '1px solid var(--border)', fontSize: 15, marginBottom: 20, resize: 'vertical', background: '#fff' } }), _jsx("button", { onClick: endVisit, style: { width: '100%', height: 56, borderRadius: 14, background: 'var(--teal)', color: '#fff', fontSize: 17, fontWeight: 700, marginBottom: 12, boxShadow: '0 4px 14px rgba(0,128,128,0.3)' }, children: "\u2705 End & Save Visit" }), _jsx("button", { onClick: cancelVisit, style: { width: '100%', height: 48, borderRadius: 14, background: '#fff', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: 15, fontWeight: 600 }, children: "\u2715 Cancel Visit" })] }));
}
