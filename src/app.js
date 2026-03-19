import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LockScreen from './screens/LockScreen';
import MainLayout from './screens/MainLayout';
import Dashboard from './screens/Dashboard';
import PatientList from './screens/PatientList';
import AddPatient from './screens/AddPatient';
import PatientDetail from './screens/PatientDetail';
import ActiveVisit from './screens/ActiveVisit';
import VisitLog from './screens/VisitLog';
import QuickComm from './screens/QuickComm';
import Billing from './screens/Billing';
function Guard({ children }) {
    const auth = useAuthStore(s => s.isAuthenticated);
    return auth ? _jsx(_Fragment, { children: children }) : _jsx(Navigate, { to: "/phyjio/lock", replace: true });
}
export default function App() {
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/phyjio/lock", element: _jsx(LockScreen, {}) }), _jsxs(Route, { path: "/phyjio", element: _jsx(Guard, { children: _jsx(MainLayout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "patients", element: _jsx(PatientList, {}) }), _jsx(Route, { path: "patients/add", element: _jsx(AddPatient, {}) }), _jsx(Route, { path: "patients/:id", element: _jsx(PatientDetail, {}) }), _jsx(Route, { path: "visits", element: _jsx(VisitLog, {}) }), _jsx(Route, { path: "visit/active/:patientId", element: _jsx(ActiveVisit, {}) }), _jsx(Route, { path: "messages", element: _jsx(QuickComm, {}) }), _jsx(Route, { path: "billing", element: _jsx(Billing, {}) })] }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/phyjio", replace: true }) })] }) }));
}
