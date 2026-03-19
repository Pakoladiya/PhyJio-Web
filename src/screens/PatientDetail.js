import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams, useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
export default function PatientDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { patients, getPatientVisits, updateVisit } = useDataStore();
    const patient = patients.find(p => p.id === id);
    const visits = getPatientVisits(id);
    if (!patient)
        return _jsx("div", { style: { padding: 32, textAlign: 'center' }, children: "Patient not found" });
    const done = visits.filter(v => v.status === 'completed');
    const totalBilled = done.reduce((s, v) => s + v.charge, 0);
    const totalPaid = done.filter(v => v.isPaid).reduce((s, v) => s + v.charge, 0);
    const balance = totalBilled - totalPaid;
    return (_jsxs("div", { style: { padding: 16 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12, paddingTop: 12, marginBottom: 20 }, children: [_jsx("button", { onClick: () => navigate(-1), style: { fontSize: 28, color: 'var(--teal)', lineHeight: 1 }, children: "\u2039" }), _jsx("h2", { style: { fontSize: 20, fontWeight: 800 }, children: "Patient Profile" })] }), _jsxs("div", { style: { background: 'var(--teal)', borderRadius: 16, padding: 20, marginBottom: 16, color: '#fff' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 16 }, children: [_jsx("div", { style: { width: 60, height: 60, borderRadius: 30, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 800 }, children: patient.fullName.charAt(0) }), _jsxs("div", { children: [_jsx("h3", { style: { fontSize: 20, fontWeight: 800 }, children: patient.fullName }), _jsxs("p", { style: { opacity: 0.85, fontSize: 14 }, children: [patient.ailment, " \u2022 ", patient.age, " yrs"] }), patient.phone && (_jsxs("a", { href: `tel:${patient.phone}`, style: { opacity: 0.85, fontSize: 13 }, children: ["\uD83D\uDCDE ", patient.phone] }))] })] }), patient.address && _jsxs("p", { style: { marginTop: 10, opacity: 0.75, fontSize: 13 }, children: ["\uD83D\uDCCD ", patient.address] }), patient.referredBy && _jsxs("p", { style: { marginTop: 4, opacity: 0.75, fontSize: 13 }, children: ["\uD83D\uDC68\u200D\u2695\uFE0F Ref: ", patient.referredBy] })] }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }, children: [
                    { label: 'Visits', value: done.length },
                    { label: 'Billed', value: `₹${totalBilled}` },
                    { label: 'Balance', value: `₹${balance}` },
                ].map((s, i) => (_jsxs("div", { style: { background: '#fff', borderRadius: 12, padding: '12px 8px', textAlign: 'center', boxShadow: 'var(--shadow)' }, children: [_jsx("p", { style: { fontSize: 18, fontWeight: 800, color: 'var(--teal)' }, children: s.value }), _jsx("p", { style: { fontSize: 11, color: 'var(--text-muted)' }, children: s.label })] }, i))) }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }, children: [
                    { label: '▶ Start Visit', bg: 'var(--teal)', color: '#fff', go: () => navigate(`/phyjio/visit/active/${patient.id}`) },
                    { label: '💬 WhatsApp', bg: '#25D366', color: '#fff', go: () => navigate('/phyjio/messages', { state: { patient } }) },
                    { label: '🧾 Generate Bill', bg: '#fff', color: 'var(--text)', go: () => navigate('/phyjio/billing', { state: { patient } }) },
                    { label: '✏️ Edit', bg: '#fff', color: 'var(--text)', go: () => navigate('/phyjio/patients/add', { state: { patient } }) },
                ].map((a, i) => (_jsx("button", { onClick: a.go, style: { height: 52, borderRadius: 12, background: a.bg, color: a.color, fontWeight: 700, fontSize: 14, border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }, children: a.label }, i))) }), _jsx("h3", { style: { fontSize: 16, fontWeight: 700, marginBottom: 12 }, children: "Visit History" }), done.length === 0 ? (_jsx("p", { style: { textAlign: 'center', color: 'var(--text-muted)', padding: 24 }, children: "No visits yet" })) : done.map(v => (_jsxs("div", { style: { background: '#fff', borderRadius: 12, padding: '12px 14px', marginBottom: 10, boxShadow: 'var(--shadow)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { children: [_jsx("p", { style: { fontWeight: 600, fontSize: 14 }, children: new Date(v.startTime).toLocaleDateString('en-IN') }), _jsx("p", { style: { fontSize: 12, color: 'var(--text-muted)' }, children: v.durationMin ? `${v.durationMin} min` : '—' }), v.notes && _jsxs("p", { style: { fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }, children: [v.notes.slice(0, 40), v.notes.length > 40 ? '...' : ''] })] }), _jsxs("div", { style: { textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }, children: [_jsxs("p", { style: { fontWeight: 700, color: 'var(--teal)' }, children: ["\u20B9", v.charge] }), _jsx("button", { onClick: () => updateVisit(v.id, { isPaid: !v.isPaid }), style: { fontSize: 11, padding: '3px 10px', borderRadius: 20, cursor: 'pointer', border: 'none',
                                    background: v.isPaid ? '#E8FFF3' : '#FFF3E0',
                                    color: v.isPaid ? 'var(--success)' : 'var(--warning)' }, children: v.isPaid ? '✓ Paid' : 'Unpaid' })] })] }, v.id)))] }));
}
