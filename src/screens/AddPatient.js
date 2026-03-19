import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useDataStore } from '../store/dataStore';
import { useNavigate } from 'react-router-dom';
// ✅ Converts any string to Title Case
function toTitleCase(str) {
    return str.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}
// ✅ Handler — applies title case only on text fields
function titleCaseHandler(k, setF) {
    return (e) => {
        const val = e.target.value;
        setF((x) => ({ ...x, [k]: toTitleCase(val) }));
    };
}
// ✅ Raw handler — for number/phone fields (no title case)
function rawHandler(k, setF) {
    return (e) => {
        setF((x) => ({ ...x, [k]: e.target.value }));
    };
}
export default function AddPatient() {
    const { addPatient } = useDataStore();
    const navigate = useNavigate();
    const [f, setF] = useState({
        fullName: '', age: '', phone: '', address: '',
        ailment: '', referredBy: '', chargePerVisit: '', medicalHistory: ''
    });
    function save() {
        if (!f.fullName.trim() || !f.ailment.trim())
            return alert('Name and Ailment are required');
        addPatient({
            fullName: f.fullName,
            age: Number(f.age) || 0,
            phone: f.phone,
            address: f.address,
            ailment: f.ailment,
            referredBy: f.referredBy,
            chargePerVisit: Number(f.chargePerVisit) || 0,
            medicalHistory: f.medicalHistory,
            isActive: true
        });
        navigate('/phyjio/patients');
    }
    const inp = {
        width: '100%', padding: '13px 16px', borderRadius: 12,
        border: '1px solid var(--border)', fontSize: 15,
        background: '#fff', marginBottom: 12
    };
    const lbl = {
        fontSize: 13, fontWeight: 600,
        color: 'var(--text-muted)', marginBottom: 4, display: 'block'
    };
    return (_jsxs("div", { style: { padding: 16, paddingBottom: 100 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12, paddingTop: 12, marginBottom: 20 }, children: [_jsx("button", { onClick: () => navigate(-1), style: { fontSize: 28, color: 'var(--teal)', lineHeight: 1 }, children: "\u2039" }), _jsx("h2", { style: { fontSize: 20, fontWeight: 800 }, children: "Add New Patient" })] }), _jsx("label", { style: lbl, children: "Full Name *" }), _jsx("input", { style: inp, value: f.fullName, onChange: titleCaseHandler('fullName', setF), placeholder: "E.g. Ramesh Patel" }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }, children: [_jsxs("div", { children: [_jsx("label", { style: lbl, children: "Age" }), _jsx("input", { style: { ...inp, marginBottom: 0 }, type: "number", value: f.age, onChange: rawHandler('age', setF), placeholder: "35" })] }), _jsxs("div", { children: [_jsx("label", { style: lbl, children: "Phone" }), _jsx("input", { style: { ...inp, marginBottom: 0 }, type: "tel", value: f.phone, onChange: rawHandler('phone', setF), placeholder: "98765 43210" })] })] }), _jsx("label", { style: lbl, children: "Address" }), _jsx("input", { style: inp, value: f.address, onChange: titleCaseHandler('address', setF), placeholder: "House No, Street, Area" }), _jsx("label", { style: lbl, children: "Ailment / Condition *" }), _jsx("input", { style: inp, value: f.ailment, onChange: titleCaseHandler('ailment', setF), placeholder: "E.g. Knee Osteoarthritis" }), _jsx("label", { style: lbl, children: "Referred By" }), _jsx("input", { style: inp, value: f.referredBy, onChange: titleCaseHandler('referredBy', setF), placeholder: "Dr. Sharma / Self" }), _jsx("label", { style: lbl, children: "Charge Per Visit (\u20B9)" }), _jsx("input", { style: inp, type: "number", value: f.chargePerVisit, onChange: rawHandler('chargePerVisit', setF), placeholder: "500" }), _jsx("label", { style: lbl, children: "Medical History / Notes" }), _jsx("textarea", { style: { ...inp, minHeight: 100, resize: 'vertical' }, value: f.medicalHistory, onChange: titleCaseHandler('medicalHistory', setF), placeholder: "Diabetes, Hypertension, Previous Surgeries..." }), _jsx("button", { onClick: save, style: {
                    width: '100%', height: 56, borderRadius: 14,
                    background: 'var(--ig-gradient)',
                    color: '#fff', fontSize: 17, fontWeight: 700,
                    marginTop: 8, boxShadow: '0 4px 14px rgba(221,42,123,0.3)'
                }, children: "\u2705 Save Patient" })] }));
}
