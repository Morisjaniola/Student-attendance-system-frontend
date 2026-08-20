import { create } from 'zustand'
import { EMPTY_ANALYTICS_FILTERS } from '../types/analytics'
import type { AnalyticsFilters, DatePreset } from '../types/analytics'

// ---------------------------------------------------------------------------
// Quick date preset helpers.
// ---------------------------------------------------------------------------

function todayISO(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function startOfWeekISO(): string {
  const now = new Date()
  const day = now.getDay() // 0=Sun
  const diff = day === 0 ? 6 : day - 1 // Monday-based week
  const start = new Date(now)
  start.setDate(start.getDate() - diff)
  const y = start.getFullYear()
  const m = String(start.getMonth() + 1).padStart(2, '0')
  const dd = String(start.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function startOfMonthISO(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}-01`
}

function dateRangeForPreset(preset: DatePreset): { dateFrom: string; dateTo: string } {
  const today = todayISO()
  switch (preset) {
    case 'Today':
      return { dateFrom: today, dateTo: today }
    case 'This Week':
      return { dateFrom: startOfWeekISO(), dateTo: today }
    case 'This Month':
      return { dateFrom: startOfMonthISO(), dateTo: today }
    default:
      return { dateFrom: '', dateTo: '' }
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

interface AnalyticsStore {
  filters: AnalyticsFilters
  /** Currently selected quick date preset. */
  datePreset: DatePreset
  setFilter: (patch: Partial<AnalyticsFilters>) => void
  setDatePreset: (preset: DatePreset) => void
  reset: () => void
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  filters: { ...EMPTY_ANALYTICS_FILTERS },
  datePreset: 'Custom',
  setFilter: (patch) => set((state) => ({ filters: { ...state.filters, ...patch } })),
  setDatePreset: (preset) => {
    const range = dateRangeForPreset(preset)
    set((state) => ({ datePreset: preset, filters: { ...state.filters, ...range } }))
  },
  reset: () => set({ filters: { ...EMPTY_ANALYTICS_FILTERS }, datePreset: 'Custom' }),
}))
