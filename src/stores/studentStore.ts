import { create } from 'zustand'
import type { StudentFiltersState } from '../types/student'

const defaultFilters: StudentFiltersState = { query: '', course: 'All', yearLevel: 'All', section: 'All', status: 'All', gender: 'All', registeredFrom: '', registeredTo: '' }

interface StudentStore { filters: StudentFiltersState; selectedIds: string[]; setFilters: (filters: Partial<StudentFiltersState>) => void; resetFilters: () => void; setSelectedIds: (ids: string[]) => void }

export const useStudentStore = create<StudentStore>((set) => ({ filters: defaultFilters, selectedIds: [], setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })), resetFilters: () => set({ filters: defaultFilters }), setSelectedIds: (selectedIds) => set({ selectedIds }) }))
