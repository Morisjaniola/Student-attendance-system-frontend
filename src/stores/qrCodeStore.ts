import { create } from 'zustand'
import type { QRCodeStatus } from '../types/qrCode'

interface QRCodeStore {
  query: string
  statusFilter: QRCodeStatus | 'All'
  setQuery: (query: string) => void
  setStatusFilter: (status: QRCodeStatus | 'All') => void
  resetFilters: () => void
}

export const useQRCodeStore = create<QRCodeStore>((set) => ({
  query: '',
  statusFilter: 'All',
  setQuery: (query) => set({ query }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  resetFilters: () => set({ query: '', statusFilter: 'All' }),
}))
