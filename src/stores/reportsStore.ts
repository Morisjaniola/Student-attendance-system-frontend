import { create } from 'zustand'
import { EMPTY_REPORT_FILTERS } from '../types/report'
import type { ReportFilters, ReportType } from '../types/report'

interface ReportsStore {
  filters: ReportFilters
  query: string
  setType: (type: ReportType) => void
  setFilter: <K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) => void
  setQuery: (query: string) => void
  reset: () => void
}

export const useReportsStore = create<ReportsStore>((set) => ({
  filters: { ...EMPTY_REPORT_FILTERS },
  query: '',
  setType: (type) => set((state) => ({ filters: { ...state.filters, type } })),
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  setQuery: (query) => set({ query }),
  reset: () => set({ filters: { ...EMPTY_REPORT_FILTERS }, query: '' }),
}))
