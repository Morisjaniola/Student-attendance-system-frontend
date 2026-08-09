import { create } from 'zustand'
import { EMPTY_USER_FILTERS } from '../types/user'
import type { UserFilters } from '../types/user'

interface UserStore {
  filters: UserFilters
  setQuery: (query: string) => void
  setFilter: <K extends keyof UserFilters>(key: K, value: UserFilters[K]) => void
  resetFilters: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  filters: { ...EMPTY_USER_FILTERS },
  setQuery: (query) => set((state) => ({ filters: { ...state.filters, query } })),
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: { ...EMPTY_USER_FILTERS } }),
}))
