import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LockScreen     from './screens/LockScreen'
import RegisterScreen from './screens/RegisterScreen'
import MainLayout     from './screens/MainLayout'
import Dashboard     from './screens/Dashboard'
import PatientList   from './screens/PatientList'
import AddPatient    from './screens/AddPatient'
import PatientDetail from './screens/PatientDetail'
import ActiveVisit   from './screens/ActiveVisit'
import VisitLog      from './screens/VisitLog'
import RecordsScreen from './screens/RecordsScreen'
import Billing       from './screens/Billing'

function Guard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isRegistered } = useAuthStore()
  if (!isRegistered)   return <Navigate to="/phyjio/register" replace />
  if (!isAuthenticated) return <Navigate to="/phyjio/lock" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/phyjio/register" element={<RegisterScreen />} />
        <Route path="/phyjio/lock"     element={<LockScreen />} />
        <Route path="/phyjio" element={<Guard><MainLayout /></Guard>}>
          <Route index                              element={<Dashboard />} />
          <Route path="patients"                    element={<PatientList />} />
          <Route path="patients/add"                element={<AddPatient />} />
          <Route path="patients/:id"                element={<PatientDetail />} />
          <Route path="visits"                      element={<VisitLog />} />
          <Route path="visit/active/:patientId"     element={<ActiveVisit />} />
          <Route path="records"                     element={<RecordsScreen />} />
          <Route path="billing"                     element={<Billing />} />
        </Route>
        <Route path="*" element={<Navigate to="/phyjio" replace />} />
      </Routes>
    </BrowserRouter>
  )
}