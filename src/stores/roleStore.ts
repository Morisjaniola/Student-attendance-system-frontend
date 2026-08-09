import { create } from 'zustand'
import { EMPTY_ROLE_FILTERS } from '../types/role'
import type { RoleFilters } from '../types/role'

interface RoleStore {
  filters: RoleFilters
  permissionRevision: number
  setQuery: (query: string) => void
  setStatus: (status: RoleFilters['status']) => void
  resetFilters: () => void
  refreshPermissions: () => void
}

export const useRoleStore = create<RoleStore>((set) => ({
  filters: { ...EMPTY_ROLE_FILTERS },
  permissionRevision: 0,
  setQuery: (query) => set((state) => ({ filters: { ...state.filters, query } })),
  setStatus: (status) => set((state) => ({ filters: { ...state.filters, status } })),
  resetFilters: () => set({ filters: { ...EMPTY_ROLE_FILTERS } }),
  refreshPermissions: () => set((state) => ({ permissionRevision: state.permissionRevision + 1 })),
}))
