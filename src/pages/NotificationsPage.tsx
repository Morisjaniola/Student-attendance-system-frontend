import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Bell, BellRing, CheckCheck, LoaderCircle } from 'lucide-react'
import { useMemo } from 'react'
import { NotificationFilters } from '../components/notifications/NotificationFilters'
import { NotificationList } from '../components/notifications/NotificationList'
import { useSystemSettings } from '../hooks/useSystemSettings'
import { NOTIFICATIONS_QUERY_KEY, NOTIFICATIONS_STALE_TIME, filterNotifications, isNotificationUnread, notificationService } from '../services/notificationService'
import { useNotificationStore } from '../stores/notificationStore'

export function NotificationsPage() {
  const { filter, overrides, setFilter, markRead, markUnread, markAllRead } = useNotificationStore()
  const notificationsEnabled = useSystemSettings((settings) => settings.notifications.notificationsEnabled)

  const { data: notifications = [], isPending, isError } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: notificationService.list,
    staleTime: NOTIFICATIONS_STALE_TIME,
    // Always reflect freshly recorded scans from Attendance Monitoring.
    refetchOnMount: 'always',
  })

  const unreadIds = useMemo(() => {
    const ids = new Set<string>()
    for (const notification of notifications) {
      if (isNotificationUnread(notification, overrides)) ids.add(notification.id)
    }
    return ids
  }, [notifications, overrides])

  const filtered = useMemo(() => filterNotifications(notifications, filter, overrides), [notifications, filter, overrides])

  const counts = useMemo(
    () => ({
      All: notifications.length,
      Unread: unreadIds.size,
      'Late Student': notifications.filter((notification) => notification.type === 'Late Student').length,
      'Attendance Confirmation': notifications.filter((notification) => notification.type === 'Attendance Confirmation').length,
    }),
    [notifications, unreadIds],
  )

  if (isPending) {
    return <div className="grid min-h-[65vh] place-items-center"><p className="flex items-center gap-3 text-sm font-medium text-slate-400"><LoaderCircle size={21} className="animate-spin text-blue-600" />Loading notifications…</p></div>
  }

  if (isError) {
    return <div className="grid min-h-[65vh] place-items-center"><div className="max-w-sm rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-500/10 dark:text-rose-300"><AlertCircle className="mx-auto mb-3" />Notifications could not be loaded. Please refresh and try again.</div></div>
  }

  return (
    <div className="space-y-6">
      {!notificationsEnabled && (
        <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>Notifications are currently disabled in System Settings. New attendance alerts will not be generated until notifications are re-enabled. Existing notifications remain visible.</span>
        </div>
      )}
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.15em] text-blue-600">Alerts &amp; updates</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Notifications</h1>
          <p className="mt-1.5 text-sm text-slate-500">View attendance-related notifications and alerts.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
            <Bell size={13} />{notifications.length} total
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            <BellRing size={13} />{counts.Unread} unread
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCheck size={13} />{counts['Late Student']} late alerts
          </span>
          <button
            type="button"
            onClick={() => markAllRead(notifications.map((notification) => notification.id))}
            disabled={counts.Unread === 0}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <CheckCheck size={13} />Mark all read
          </button>
        </div>
      </section>

      <NotificationFilters value={filter} onChange={setFilter} counts={counts} />

      <NotificationList notifications={filtered} unreadIds={unreadIds} onMarkRead={markRead} onMarkUnread={markUnread} />
    </div>
  )
}
