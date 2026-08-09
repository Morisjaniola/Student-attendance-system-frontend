import { create } from 'zustand'
import type { AttendanceMethod } from '../types/dashboard'

interface AttendanceStore {
  activeMethod: AttendanceMethod
  setActiveMethod: (method: AttendanceMethod) => void
}

export const useAttendanceStore = create<AttendanceStore>((set) => ({
  activeMethod: 'QR Code',
  setActiveMethod: (activeMethod) => set({ activeMethod }),
}))
