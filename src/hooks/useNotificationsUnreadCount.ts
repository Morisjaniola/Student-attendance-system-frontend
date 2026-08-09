import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { NOTIFICATIONS_QUERY_KEY, NOTIFICATIONS_STALE_TIME, isNotificationUnread, notificationService } from '../services/notificationService'
import { useNotificationStore } from '../stores/notificationStore'

/**
 * Unread notification count for app-wide badges (sidebar). Shares the same
 * react-query cache as the Notifications page, and applies the local
 * read/unread overrides from the notification store.
 */
export function useNotificationsUnreadCount(): number {
  const { data } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: notificationService.list,
    staleTime: NOTIFICATIONS_STALE_TIME,
  })
  const overrides = useNotificationStore((state) => state.overrides)

  return useMemo(() => {
    if (!data) return 0
    return data.filter((notification) => isNotificationUnread(notification, overrides)).length
  }, [data, overrides])
}
