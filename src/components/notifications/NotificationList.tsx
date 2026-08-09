import { BellOff } from 'lucide-react'
import { NotificationItem } from './NotificationItem'
import type { AppNotification } from '../../types/notification'

interface NotificationListProps {
  notifications: AppNotification[]
  /** Effective unread set after local overrides. */
  unreadIds: Set<string>
  onMarkRead: (id: string) => void
  onMarkUnread: (id: string) => void
}

export function NotificationList({ notifications, unreadIds, onMarkRead, onMarkUnread }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="grid min-h-64 place-items-center rounded-2xl border border-slate-200/80 bg-white px-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <BellOff className="mx-auto mb-3 text-slate-300" size={32} />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No notifications found.</p>
          <p className="mt-1 text-xs text-slate-400">New late alerts and attendance confirmations will appear here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          read={!unreadIds.has(notification.id)}
          onMarkRead={() => onMarkRead(notification.id)}
          onMarkUnread={() => onMarkUnread(notification.id)}
        />
      ))}
    </div>
  )
}
