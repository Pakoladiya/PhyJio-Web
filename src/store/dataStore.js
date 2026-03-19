import { create } from 'zustand';
import { persist } from 'zustand/middleware';
function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
export const useDataStore = create()(persist((set) => ({
    patients: [],
    visits: [],
    addPatient: (p) => set((s) => ({
        patients: [...s.patients, { ...p, id: uid(), createdAt: Date.now() }],
    })),
    updatePatient: (id, updates) => set((s) => ({
        patients: s.patients.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),
    deletePatient: (id) => set((s) => ({
        patients: s.patients.filter((p) => p.id !== id),
    })),
    addVisit: (v) => set((s) => ({
        visits: [...s.visits, { ...v, id: uid() }],
    })),
    updateVisit: (id, updates) => set((s) => ({
        visits: s.visits.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    })),
    deleteVisit: (id) => set((s) => ({
        visits: s.visits.filter((v) => v.id !== id),
    })),
}), { name: 'phyjio-data' }));
