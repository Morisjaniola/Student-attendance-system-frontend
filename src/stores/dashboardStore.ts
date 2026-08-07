import { create } from 'zustand'
import type { AttendanceStatus } from '../types/dashboard'

interface DashboardStore {
  activitySearch: string
  statusFilter: AttendanceStatus | 'All'
  setActivitySearch: (value: string) => void
  setStatusFilter: (value: AttendanceStatus | 'All') => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  activitySearch: '',
  statusFilter: 'All',
  setActivitySearch: (activitySearch) => set({ activitySearch }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
}))
