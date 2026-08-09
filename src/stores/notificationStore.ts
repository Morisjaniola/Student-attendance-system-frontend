import { create } from 'zustand'
import type { ReadOverride } from '../services/notificationService'
import type { NotificationFilter } from '../types/notification'

interface NotificationStore {
  filter: NotificationFilter
  /** Notification id -> local read state, layered over the seed data. */
  overrides: Record<string, ReadOverride>
  setFilter: (filter: NotificationFilter) => void
  markRead: (id: string) => void
  markUnread: (id: string) => void
  /** Marks every id in the list as read (used by "Mark all read"). */
  markAllRead: (ids: string[]) => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  filter: 'All',
  overrides: {},
  setFilter: (filter) => set({ filter }),
  markRead: (id) => set((state) => ({ overrides: { ...state.overrides, [id]: 'read' } })),
  markUnread: (id) => set((state) => ({ overrides: { ...state.overrides, [id]: 'unread' } })),
  markAllRead: (ids) =>
    set((state) => {
      const overrides = { ...state.overrides }
      ids.forEach((id) => { overrides[id] = 'read' })
      return { overrides }
    }),
}))
