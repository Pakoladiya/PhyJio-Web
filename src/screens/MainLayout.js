import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, NavLink } from 'react-router-dom';
const tabs = [
    { to: '/phyjio', icon: '🏠', label: 'Home', end: true },
    { to: '/phyjio/patients', icon: '👥', label: 'Patients' },
    { to: '/phyjio/visits', icon: '⏱️', label: 'Visits' },
    { to: '/phyjio/messages', icon: '💬', label: 'Messages' },
    { to: '/phyjio/billing', icon: '🧾', label: 'Billing' },
];
export default function MainLayout() {
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: 480, margin: '0 auto' }, children: [_jsx("div", { style: { flex: 1, overflowY: 'auto', paddingBottom: 70 }, children: _jsx(Outlet, {}) }), _jsx("nav", { style: {
                    position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                    width: '100%', maxWidth: 480,
                    height: 64, background: '#fff',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    boxShadow: '0 -2px 12px rgba(0,128,128,0.08)'
                }, children: tabs.map(t => (_jsxs(NavLink, { to: t.to, end: t.end, style: ({ isActive }) => ({
                        flex: 1, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: 2,
                        color: isActive ? 'var(--teal)' : 'var(--text-muted)',
                        fontWeight: isActive ? 700 : 400,
                        fontSize: 11, transition: 'color 0.2s'
                    }), children: [_jsx("span", { style: { fontSize: 22 }, children: t.icon }), t.label] }, t.to))) })] }));
}
