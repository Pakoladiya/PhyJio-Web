import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Patient {
  id: string
  fullName: string
  age: number
  phone: string
  address: string
  ailment: string
  referredBy: string
  chargePerVisit: number
  medicalHistory: string
  isActive: boolean
  createdAt: number
}

export interface Visit {
  id: string
  patientId: string
  startTime: number
  endTime?: number
  status: 'active' | 'completed' | 'cancelled'
  charge: number
  notes: string
  duration?: number
  durationMin?: number
  isPaid?: boolean
}

export interface PatientRecord {
  id: string
  patientId: string
  type: 'report' | 'progression'
  date: number
  notes: string
}

export interface Payment {
  id: string
  patientId: string
  amount: number
  date: number
  method: 'cash' | 'upi' | 'other'
  note: string
}

interface DataState {
  patients: Patient[]
  visits: Visit[]
  records: PatientRecord[]
  payments: Payment[]

  addPatient: (p: Omit<Patient, 'id' | 'createdAt'>) => string
  updatePatient: (id: string, updates: Partial<Patient>) => void
  deletePatient: (id: string) => void
  getPatientVisits: (patientId: string) => Visit[]

  addVisit: (v: Omit<Visit, 'id'>) => Visit
  updateVisit: (id: string, updates: Partial<Visit>) => void
  deleteVisit: (id: string) => void

  addRecord: (r: Omit<PatientRecord, 'id'>) => string
  deleteRecord: (id: string) => void

  addPayment: (p: Omit<Payment, 'id'>) => void
  deletePayment: (id: string) => void
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      patients: [],
      visits: [],
      records: [],
      payments: [],

      addPatient: (p) => {
        const id = uid()
        set((s) => ({ patients: [...s.patients, { ...p, id, createdAt: Date.now() }] }))
        return id
      },

      updatePatient: (id, updates) =>
        set((s) => ({ patients: s.patients.map((p) => (p.id === id ? { ...p, ...updates } : p)) })),

      deletePatient: (id) =>
        set((s) => ({ patients: s.patients.filter((p) => p.id !== id) })),

      getPatientVisits: (patientId) =>
        get().visits.filter((v) => v.patientId === patientId),

      addVisit: (v) => {
        const newVisit: Visit = { ...v, id: uid() }
        set((s) => ({ visits: [...s.visits, newVisit] }))
        return newVisit
      },

      updateVisit: (id, updates) =>
        set((s) => ({ visits: s.visits.map((v) => (v.id === id ? { ...v, ...updates } : v)) })),

      deleteVisit: (id) =>
        set((s) => ({ visits: s.visits.filter((v) => v.id !== id) })),

      addRecord: (r) => {
        const id = uid()
        set((s) => ({ records: [...s.records, { ...r, id }] }))
        return id
      },

      deleteRecord: (id) =>
        set((s) => ({ records: s.records.filter((r) => r.id !== id) })),

      addPayment: (p) =>
        set((s) => ({ payments: [...s.payments, { ...p, id: uid() }] })),

      deletePayment: (id) =>
        set((s) => ({ payments: s.payments.filter((p) => p.id !== id) })),
    }),
    { name: 'phyjio-data' }
  )
)
