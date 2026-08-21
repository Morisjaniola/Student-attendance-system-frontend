import { BellRing, CalendarDays, CheckCheck, Clock, CircleCheck, TriangleAlert } from 'lucide-react'
import { useFormatPreferences } from '../../hooks/useFormatting'
import { NotificationBadge } from './NotificationBadge'
import type { AppNotification } from '../../types/notification'
import { formatDate, formatTime } from '../../utils/format'

interface NotificationItemProps {
  notification: AppNotification
  /** Effective read state (seed data + local overrides). */
  read: boolean
  onMarkRead: () => void
  onMarkUnread: () => void
}

export function NotificationItem({ notification, read, onMarkRead, onMarkUnread }: NotificationItemProps) {
  const { timeFormat, dateFormat } = useFormatPreferences()
  const isLate = notification.type === 'Late Student'
  const Icon = isLate ? TriangleAlert : CircleCheck
  const iconStyle = isLate
    ? 'bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300'
    : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300'

  return (
    <article
      className={`relative flex gap-3.5 px-4 py-4 transition-colors sm:px-5 ${
        read ? 'bg-white hover:bg-slate-50/70 dark:bg-slate-900 dark:hover:bg-slate-900/60' : 'bg-blue-50/60 hover:bg-blue-50 dark:bg-blue-500/[.07] dark:hover:bg-blue-500/10'
      }`}
    >
      {!read && <span className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-blue-600" aria-hidden="true" />}

      <span className={`mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl ${iconStyle}`}>
        <Icon size={18} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={`text-sm ${read ? 'font-semibold text-slate-700 dark:text-slate-200' : 'font-bold text-slate-900 dark:text-white'}`}>{notification.title}</h3>
          <NotificationBadge type={notification.type} />
          {!read && <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">Unread</span>}
        </div>

        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{notification.description}</p>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className={`grid size-5 place-items-center rounded-full text-[9px] font-bold ${notification.student.avatarColor}`}>{notification.student.initials}</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">{notification.student.name}</span>
          </span>
          <span>{notification.student.studentId}</span>
          <span>{notification.student.courseCode} · {notification.student.section}</span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1"><CalendarDays size={12} />{formatDate(notification.date, dateFormat)}</span>
          <span className="inline-flex items-center gap-1"><Clock size={12} />{formatTime(notification.time, timeFormat)}</span>
          {notification.method && (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">Method: {notification.method}</span>
          )}
          {notification.status && (
            <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold ${isLate ? 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300'}`}>Status: {notification.status}</span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-start">
        {read ? (
          <button
            type="button"
            onClick={onMarkUnread}
            aria-label={`Mark "${notification.title}" as unread`}
            title="Mark as unread"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
          >
            <BellRing size={15} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onMarkRead}
            aria-label={`Mark "${notification.title}" as read`}
            title="Mark as read"
            className="rounded-lg p-2 text-blue-600 transition hover:bg-white hover:shadow-sm dark:hover:bg-slate-800"
          >
            <CheckCheck size={15} />
          </button>
        )}
      </div>
    </article>
  )
}
