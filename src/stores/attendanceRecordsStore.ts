import { create } from 'zustand'
import { EMPTY_ATTENDANCE_FILTERS } from '../types/attendanceRecord'
import type { AttendanceRecordFilters } from '../types/attendanceRecord'

interface AttendanceRecordsStore {
  query: string
  filters: AttendanceRecordFilters
  setQuery: (query: string) => void
  setFilter: <K extends keyof AttendanceRecordFilters>(key: K, value: AttendanceRecordFilters[K]) => void
  resetQuery: () => void
  clearFilters: () => void
  resetAll: () => void
}

export const useAttendanceRecordsStore = create<AttendanceRecordsStore>((set) => ({
  query: '',
  filters: { ...EMPTY_ATTENDANCE_FILTERS },
  setQuery: (query) => set({ query }),
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetQuery: () => set({ query: '' }),
  clearFilters: () => set({ filters: { ...EMPTY_ATTENDANCE_FILTERS } }),
  resetAll: () => set({ query: '', filters: { ...EMPTY_ATTENDANCE_FILTERS } }),
}))
