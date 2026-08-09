import { ArrowLeftRight, LoaderCircle, Power, PowerOff, UserPlus } from 'lucide-react'
import type { RFIDCard } from '../../types/rfid'
import { initials } from '../../utils/format'
import { RFIDStatusBadge } from './RFIDStatusBadge'

interface RFIDCardViewProps {
  card: RFIDCard
  onAssign: (card: RFIDCard) => void
  onReplace: (card: RFIDCard) => void
  onToggleStatus: (card: RFIDCard) => void
  busy?: boolean
}

export function RFIDCardView({ card, onAssign, onReplace, onToggleStatus, busy }: RFIDCardViewProps) {
  const assignable = card.status === 'Unassigned'
  const replaceable = Boolean(card.studentId)
  const deactivating = card.status === 'Active' || card.status === 'Unassigned'

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-sm font-bold text-slate-800 dark:text-slate-100">{card.cardNumber}</p>
          <p className="mt-0.5 text-[10px] text-slate-400">Registered {card.registeredAt}</p>
        </div>
        <RFIDStatusBadge status={card.status} />
      </div>

      <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950/60">
        {card.studentName ? (
          <div className="flex items-center gap-3">
            <span className={`grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl text-[10px] font-bold ${card.avatarColor ?? 'bg-slate-100 text-slate-600'}`}>
              {card.photo ? <img src={card.photo} alt="" className="size-full object-cover" /> : initials(card.studentName)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-slate-700 dark:text-slate-200">{card.studentName}</p>
              <p className="mt-0.5 font-mono text-[10px] text-slate-400">{card.studentId}</p>
              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">{card.courseCode} · {card.yearLevel} · {card.section}</p>
            </div>
          </div>
        ) : (
          <p className="text-xs font-semibold text-slate-400">Unassigned to any student</p>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        {assignable && (
          <button
            onClick={() => onAssign(card)}
            disabled={busy}
            className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[11px] font-bold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
          >
            {busy ? <LoaderCircle size={14} className="animate-spin" /> : <UserPlus size={14} />}Assign
          </button>
        )}
        {replaceable && (
          <button
            onClick={() => onReplace(card)}
            disabled={busy}
            className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-3 text-[11px] font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {busy ? <LoaderCircle size={14} className="animate-spin" /> : <ArrowLeftRight size={14} />}Replace
          </button>
        )}
        {deactivating ? (
          <button
            onClick={() => onToggleStatus(card)}
            disabled={busy}
            className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-3 text-[11px] font-bold text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:opacity-60 dark:bg-slate-950 dark:hover:bg-rose-500/10"
          >
            {busy ? <LoaderCircle size={14} className="animate-spin" /> : <PowerOff size={14} />}Deactivate
          </button>
        ) : (
          <button
            onClick={() => onToggleStatus(card)}
            disabled={busy}
            className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-3 text-[11px] font-bold text-emerald-600 shadow-sm transition hover:bg-emerald-50 disabled:opacity-60 dark:bg-slate-950 dark:hover:bg-emerald-500/10"
          >
            {busy ? <LoaderCircle size={14} className="animate-spin" /> : <Power size={14} />}Activate
          </button>
        )}
      </div>
    </article>
  )
}
