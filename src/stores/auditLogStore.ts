import { create } from 'zustand'
import { EMPTY_AUDIT_LOG_FILTERS } from '../types/auditLog'
import type { AuditLogFilters } from '../types/auditLog'

interface AuditLogStore {
  filters: AuditLogFilters
  setQuery: (query: string) => void
  setFilter: <K extends keyof AuditLogFilters>(key: K, value: AuditLogFilters[K]) => void
  resetFilters: () => void
}

export const useAuditLogStore = create<AuditLogStore>((set) => ({
  filters: { ...EMPTY_AUDIT_LOG_FILTERS },
  setQuery: (query) => set((state) => ({ filters: { ...state.filters, query } })),
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: { ...EMPTY_AUDIT_LOG_FILTERS } }),
}))
