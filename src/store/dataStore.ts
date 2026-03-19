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

interface DataState {
  patients: Patient[]
  visits: Visit[]

  addPatient: (p: Omit<Patient, 'id' | 'createdAt'>) => string
  updatePatient: (id: string, updates: Partial<Patient>) => void
  deletePatient: (id: string) => void
  getPatientVisits: (patientId: string) => Visit[]

  addVisit: (v: Omit<Visit, 'id'>) => Visit
  updateVisit: (id: string, updates: Partial<Visit>) => void
  deleteVisit: (id: string) => void
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      patients: [],
      visits: [],

      addPatient: (p) => {
        const id = uid()
        set((s) => ({
          patients: [...s.patients, { ...p, id, createdAt: Date.now() }],
        }))
        return id
      },

      updatePatient: (id, updates) =>
        set((s) => ({
          patients: s.patients.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),

      deletePatient: (id) =>
        set((s) => ({
          patients: s.patients.filter((p) => p.id !== id),
        })),

      getPatientVisits: (patientId) =>
        get().visits.filter((v) => v.patientId === patientId),

      addVisit: (v) => {
        const newVisit: Visit = { ...v, id: uid() }
        set((s) => ({ visits: [...s.visits, newVisit] }))
        return newVisit
      },

      updateVisit: (id, updates) =>
        set((s) => ({
          visits: s.visits.map((v) => (v.id === id ? { ...v, ...updates } : v)),
        })),

      deleteVisit: (id) =>
        set((s) => ({
          visits: s.visits.filter((v) => v.id !== id),
        })),
    }),
    { name: 'phyjio-data' }
  )
)