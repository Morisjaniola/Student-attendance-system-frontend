import type { RFIDStatus } from '../../types/rfid'

const styles: Record<RFIDStatus, string> = {
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300',
  Inactive: 'bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-500/10 dark:text-rose-300',
  Unassigned: 'bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-500/10 dark:text-amber-300',
}

const dot: Record<RFIDStatus, string> = { Active: 'bg-emerald-500', Inactive: 'bg-rose-500', Unassigned: 'bg-amber-500' }

export function RFIDStatusBadge({ status }: { status: RFIDStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${styles[status]}`}>
      <i className={`size-1.5 rounded-full ${dot[status]}`} />
      {status}
    </span>
  )
}
