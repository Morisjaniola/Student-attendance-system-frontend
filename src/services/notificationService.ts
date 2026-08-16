import { attendanceService } from './attendanceService'
import { notificationFromRecord, seedNotifications } from '../data/notificationData'
import { readStoredSettings } from './settingsService'
import { timeToMinutes } from './attendanceRecordsService'
import type { AppNotification, NotificationFilter } from '../types/notification'

/** Local read/unread overrides keyed by notification id ('read' or 'unread'). */
export type ReadOverride = 'read' | 'unread'

// ---------------------------------------------------------------------------
// Notifications service (mock frontend implementation).
//
// Notifications are generated from attendance activity (section 15):
// seeded history comes from the attendance records, and records created live
// by Attendance Monitoring in the current session appear as fresh unread
// notifications on top. Replace the in-memory source below with PHP API calls
// when the backend is ready; the view layer keeps the same method signatures:
//
//   React  →  notificationService  →  PHP API  →  MySQL
// ---------------------------------------------------------------------------

const delay = (milliseconds = 250) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds))

/** Shared react-query key so the page and app-wide badges use one cache. */
export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const

/** How long the notifications cache is considered fresh (page + sidebar badge). */
export const NOTIFICATIONS_STALE_TIME = 30_000

/** Effective read state = local override when present, otherwise the seed value. */
export function isNotificationUnread(notification: AppNotification, overrides: Record<string, ReadOverride> = {}): boolean {
  const override = overrides[notification.id]
  return override === undefined ? notification.unread : override === 'unread'
}

/** Newest first: date desc, then time desc. '—' times sort last. */
export function sortNotifications(notifications: AppNotification[]): AppNotification[] {
  return [...notifications].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1
    return timeToMinutes(b.time) - timeToMinutes(a.time)
  })
}

/** Applies the section-11 filter (All / Unread / Late Student / Attendance Confirmation). */
export function filterNotifications(
  notifications: AppNotification[],
  filter: NotificationFilter,
  overrides: Record<string, ReadOverride> = {},
): AppNotification[] {
  return notifications.filter((notification) => {
    if (filter === 'All') return true
    if (filter === 'Unread') return isNotificationUnread(notification, overrides)
    return notification.type === filter
  })
}

/**
 * Live records from Attendance Monitoring become fresh unread notifications,
 * respecting the per-type toggles from System Settings (Late Student Alerts
 * and Attendance Confirmation Notifications).
 */
function liveNotifications(): AppNotification[] {
  const { notifications } = readStoredSettings()
  return attendanceService
    .sessionRecordsList()
    .filter((record) => {
      if (record.status === 'Late') return notifications.lateStudentAlerts
      if (record.status === 'Present') return notifications.attendanceConfirmationNotifications
      return false
    })
    .map((record) => notificationFromRecord(record, true))
}

export const notificationService = {
  async list(): Promise<AppNotification[]> {
    await delay()
    // When notifications are disabled globally, generation stops but existing
    // (seed) records remain visible — they are never deleted.
    const { notifications } = readStoredSettings()
    const live = notifications.notificationsEnabled ? liveNotifications() : []
    return sortNotifications([...seedNotifications(), ...live])
  },
}
