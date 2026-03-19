import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useDataStore } from '../store/dataStore';
export default function VisitLog() {
    const { visits, patients, updateVisit } = useDataStore();
    const [filter, setFilter] = useState('today');
    function inRange(ts) {
        const now = Date.now();
        const d = new Date(ts), n = new Date();
        if (filter === 'today')
            return d.toDateString() === n.toDateString();
        if (filter === 'week')
            return now - ts < 7 * 86400000;
        if (filter === 'month')
            return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
        return true;
    }
    // ✅ Only completed visits — active and cancelled are excluded
    const list = visits
        .filter(v => v.status === 'completed' && inRange(v.startTime))
        .sort((a, b) => b.startTime - a.startTime);
    const totalRevenue = list.reduce((s, v) => s + v.charge, 0);
    const totalPaid = list.filter(v => v.isPaid).reduce((s, v) => s + v.charge, 0);
    const totalUnpaid = totalRevenue - totalPaid;
    return (_jsxs("div", { style: { padding: 16 }, children: [_jsx("h2", { style: { fontSize: 22, fontWeight: 800, paddingTop: 12, marginBottom: 16 }, children: "Visit Log" }), _jsx("div", { style: { display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }, children: ['today', 'week', 'month', 'all'].map(f => (_jsx("button", { onClick: () => setFilter(f), style: {
                        padding: '8px 18px', borderRadius: 20, fontSize: 13,
                        fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
                        background: filter === f ? 'var(--teal)' : '#fff',
                        color: filter === f ? '#fff' : 'var(--text-muted)',
                        border: `1px solid ${filter === f ? 'var(--teal)' : 'var(--border)'}`
                    }, children: f.charAt(0).toUpperCase() + f.slice(1) }, f))) }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }, children: [
                    { label: 'Visits', value: list.length, color: 'var(--teal)' },
                    { label: 'Revenue', value: `₹${totalRevenue}`, color: 'var(--warning)' },
                    { label: 'Unpaid', value: `₹${totalUnpaid}`, color: 'var(--danger)' },
                ].map((s, i) => (_jsxs("div", { style: { background: '#fff', borderRadius: 12, padding: 14, boxShadow: 'var(--shadow)', textAlign: 'center' }, children: [_jsx("p", { style: { fontSize: 18, fontWeight: 800, color: s.color }, children: s.value }), _jsx("p", { style: { fontSize: 12, color: 'var(--text-muted)' }, children: s.label })] }, i))) }), list.length === 0 ? (_jsxs("div", { style: { textAlign: 'center', padding: 48, color: 'var(--text-muted)' }, children: [_jsx("p", { style: { fontSize: 48, marginBottom: 12 }, children: "\u23F1\uFE0F" }), _jsx("p", { style: { fontWeight: 600 }, children: "No completed visits" }), _jsx("p", { style: { fontSize: 13, marginTop: 4 }, children: filter === 'today' ? 'No visits completed today yet'
                            : filter === 'week' ? 'No visits this week'
                                : filter === 'month' ? 'No visits this month'
                                    : 'No visits recorded yet' })] })) : list.map(v => {
                const p = patients.find(x => x.id === v.patientId);
                return (_jsx("div", { style: { background: '#fff', borderRadius: 12, padding: '14px', marginBottom: 10, boxShadow: 'var(--shadow)' }, children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("p", { style: { fontWeight: 700 }, children: p?.fullName || 'Unknown' }), _jsxs("p", { style: { fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }, children: [new Date(v.startTime).toLocaleDateString('en-IN'), " \u2022", ' ', new Date(v.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), v.durationMin ? ` • ${v.durationMin} min` : ''] }), v.notes && (_jsxs("p", { style: { fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }, children: ["\uD83D\uDCDD ", v.notes.slice(0, 50), v.notes.length > 50 ? '...' : ''] }))] }), _jsxs("div", { style: { textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }, children: [_jsxs("p", { style: { fontWeight: 700, color: 'var(--teal)' }, children: ["\u20B9", v.charge] }), _jsx("button", { onClick: () => updateVisit(v.id, { isPaid: !v.isPaid }), style: {
                                            fontSize: 11, padding: '3px 10px', borderRadius: 20,
                                            cursor: 'pointer', border: 'none',
                                            background: v.isPaid ? '#E8FFF3' : '#FFF3E0',
                                            color: v.isPaid ? 'var(--success)' : 'var(--warning)'
                                        }, children: v.isPaid ? '✓ Paid' : 'Unpaid' })] })] }) }, v.id));
            })] }));
}
