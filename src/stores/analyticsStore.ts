import { create } from 'zustand'
import { EMPTY_ANALYTICS_FILTERS } from '../types/analytics'
import type { AnalyticsFilters } from '../types/analytics'

interface AnalyticsStore {
  filters: AnalyticsFilters
  setFilter: (patch: Partial<AnalyticsFilters>) => void
  reset: () => void
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  filters: { ...EMPTY_ANALYTICS_FILTERS },
  setFilter: (patch) => set((state) => ({ filters: { ...state.filters, ...patch } })),
  reset: () => set({ filters: { ...EMPTY_ANALYTICS_FILTERS } }),
}))
