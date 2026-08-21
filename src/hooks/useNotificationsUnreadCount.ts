import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { NOTIFICATIONS_QUERY_KEY, NOTIFICATIONS_STALE_TIME, isNotificationUnread, notificationService } from '../services/notificationService'
import { useNotificationStore } from '../stores/notificationStore'
import { useSystemSettings } from './useSystemSettings'

/**
 * Unread notification count for app-wide badges (sidebar). Shares the same
 * react-query cache as the Notifications page, and applies the local
 * read/unread overrides from the notification store. When notifications are
 * disabled in System Settings the count reports 0 so badges hide.
 */
export function useNotificationsUnreadCount(): number {
  const notificationsEnabled = useSystemSettings((settings) => settings.notifications.notificationsEnabled)
  const { data } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: notificationService.list,
    staleTime: NOTIFICATIONS_STALE_TIME,
  })
  const overrides = useNotificationStore((state) => state.overrides)

  return useMemo(() => {
    if (!notificationsEnabled) return 0
    if (!data) return 0
    return data.filter((notification) => isNotificationUnread(notification, overrides)).length
  }, [data, overrides, notificationsEnabled])
}
