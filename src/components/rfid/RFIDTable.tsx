import { ArrowLeftRight, LoaderCircle, Power, PowerOff, Radio, UserPlus } from 'lucide-react'
import { useState } from 'react'
import type { RFIDCard } from '../../types/rfid'
import { initials } from '../../utils/format'
import { Pagination } from '../tables/Pagination'
import { RFIDStatusBadge } from './RFIDStatusBadge'

const PAGE_SIZE = 10

interface RFIDTableProps {
  cards: RFIDCard[]
  onAssign: (card: RFIDCard) => void
  onReplace: (card: RFIDCard) => void
  onToggleStatus: (card: RFIDCard) => void
  busyCardId?: string | null
}

export function RFIDTable({ cards, onAssign, onReplace, onToggleStatus, busyCardId }: RFIDTableProps) {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const pageCount = Math.max(1, Math.ceil(cards.length / pageSize))
  const safePage = Math.min(pageIndex, pageCount - 1)
  const visible = cards.slice(safePage * pageSize, safePage * pageSize + pageSize)

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-295 text-left">
          <thead className="bg-slate-50/95 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:bg-slate-950/95">
            <tr>
              <th className="px-5 py-3">RFID card number</th>
              <th className="px-3 py-3">Student ID</th>
              <th className="px-3 py-3">Student name</th>
              <th className="px-3 py-3">Course</th>
              <th className="px-3 py-3">Year</th>
              <th className="px-3 py-3">Section</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Registration date</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {visible.map((card) => {
              const busy = busyCardId === card.id
              const assignable = card.status === 'Unassigned'
              const replaceable = Boolean(card.studentId)
              const deactivating = card.status === 'Active' || card.status === 'Unassigned'
              return (
                <tr key={card.id} className="text-xs text-slate-600 transition hover:bg-slate-50/80 dark:text-slate-300 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-200">{card.cardNumber}</td>
                  <td className="px-3 py-3.5 font-mono text-[11px] text-slate-400">{card.studentId ?? '—'}</td>
                  <td className="px-3 py-3.5">
                    {card.studentName ? (
                      <span className="flex items-center gap-2.5">
                        <span className={`grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl text-[10px] font-bold ${card.avatarColor ?? 'bg-slate-100 text-slate-600'}`}>
                          {card.photo ? <img src={card.photo} alt="" className="size-full object-cover" /> : initials(card.studentName)}
                        </span>
                        <span className="max-w-44 truncate font-semibold text-slate-700 dark:text-slate-200">{card.studentName}</span>
                      </span>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3.5">
                    {card.courseCode ? (
                      <>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{card.courseCode}</p>
                        <p className="mt-0.5 max-w-36 truncate text-[10px] text-slate-400">{card.course?.replace('BS ', '')}</p>
                      </>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3.5">{card.yearLevel ?? <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                  <td className="px-3 py-3.5">{card.section ?? <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                  <td className="px-3 py-3.5"><RFIDStatusBadge status={card.status} /></td>
                  <td className="px-3 py-3.5 text-[11px] text-slate-400">{card.registeredAt}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      {assignable && (
                        <button
                          onClick={() => onAssign(card)}
                          disabled={busy}
                          className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 dark:hover:bg-blue-500/10"
                          aria-label={`Assign ${card.cardNumber} to a student`}
                          title="Assign to student"
                        >
                          {busy ? <LoaderCircle size={15} className="animate-spin" /> : <UserPlus size={15} />}
                        </button>
                      )}
                      {replaceable && (
                        <button
                          onClick={() => onReplace(card)}
                          disabled={busy}
                          className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-amber-50 hover:text-amber-600 disabled:opacity-50 dark:hover:bg-amber-500/10"
                          aria-label={`Replace ${card.cardNumber}`}
                          title="Replace card"
                        >
                          {busy ? <LoaderCircle size={15} className="animate-spin" /> : <ArrowLeftRight size={15} />}
                        </button>
                      )}
                      {deactivating ? (
                        <button
                          onClick={() => onToggleStatus(card)}
                          disabled={busy}
                          className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:hover:bg-rose-500/10"
                          aria-label={`Deactivate ${card.cardNumber}`}
                          title="Deactivate card"
                        >
                          {busy ? <LoaderCircle size={15} className="animate-spin" /> : <PowerOff size={15} />}
                        </button>
                      ) : (
                        <button
                          onClick={() => onToggleStatus(card)}
                          disabled={busy}
                          className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50 dark:hover:bg-emerald-500/10"
                          aria-label={`Activate ${card.cardNumber}`}
                          title="Activate card"
                        >
                          {busy ? <LoaderCircle size={15} className="animate-spin" /> : <Power size={15} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-14 text-center">
                  <Radio className="mx-auto mb-2 text-slate-300" size={28} />
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No RFID cards found.</p>
                  <p className="mt-1 text-xs text-slate-400">Adjust your search or filters to see matching cards.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {cards.length > 0 && (
        <Pagination
          pageIndex={safePage}
          pageCount={pageCount}
          pageSize={pageSize}
          rowCount={cards.length}
          onPrevious={() => setPageIndex((value) => Math.max(0, value - 1))}
          onNext={() => setPageIndex((value) => Math.min(pageCount - 1, value + 1))}
          onPageSizeChange={(value) => { setPageSize(value); setPageIndex(0) }}
        />
      )}
    </section>
  )
}
