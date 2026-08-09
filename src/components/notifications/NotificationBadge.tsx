import { CircleCheck, TriangleAlert } from 'lucide-react'
import type { AppNotificationType } from '../../types/notification'

const styles: Record<AppNotificationType, string> = {
  'Late Student': 'bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-400/10 dark:text-amber-300',
  'Attendance Confirmation': 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-400/10 dark:text-emerald-300',
}

export function NotificationBadge({ type }: { type: AppNotificationType }) {
  const Icon = type === 'Late Student' ? TriangleAlert : CircleCheck
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${styles[type]}`}>
      <Icon size={11} />
      {type}
    </span>
  )
}
