import { create } from 'zustand'
import type { RFIDStatus } from '../types/rfid'

interface RFIDStore {
  query: string
  statusFilter: RFIDStatus | 'All'
  setQuery: (query: string) => void
  setStatusFilter: (status: RFIDStatus | 'All') => void
  resetFilters: () => void
}

export const useRFIDStore = create<RFIDStore>((set) => ({
  query: '',
  statusFilter: 'All',
  setQuery: (query) => set({ query }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  resetFilters: () => set({ query: '', statusFilter: 'All' }),
}))
