import { AlertCircle, LoaderCircle, Search, UserPlus, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { RFIDAssignStudent, RFIDCard } from '../../types/rfid'
import { initials } from '../../utils/format'
import { RFIDStatusBadge } from './RFIDStatusBadge'

interface AssignRFIDModalProps {
  open: boolean
  card: RFIDCard | null
  students: RFIDAssignStudent[]
  /** Student IDs that already hold an active RFID card and cannot be selected. */
  unavailableStudentIds: Set<string>
  studentsLoading: boolean
  studentsError: boolean
  loading: boolean
  onConfirm: (student: RFIDAssignStudent) => void
  onCancel: () => void
}

export function AssignRFIDModal({ open, card, students, unavailableStudentIds, studentsLoading, studentsError, loading, onConfirm, onCancel }: AssignRFIDModalProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<RFIDAssignStudent | null>(null)

  useEffect(() => { if (open) { setSearch(''); setSelected(null) } }, [open, card?.id])

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase()
    if (!value) return students
    return students.filter((student) => [student.studentId, student.name, student.courseCode, student.course, student.yearLevel, student.section].join(' ').toLowerCase().includes(value))
  }, [search, students])

  if (!open || !card) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 p-0 backdrop-blur-sm sm:p-5">
      <section role="dialog" aria-modal="true" aria-labelledby="assign-rfid-title" className="mx-auto min-h-full w-full max-w-lg bg-white shadow-2xl dark:bg-slate-900 sm:min-h-0 sm:rounded-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
          <div>
            <h2 id="assign-rfid-title" className="text-lg font-bold text-slate-900 dark:text-white">Assign RFID card</h2>
            <p className="mt-1 text-xs text-slate-400">Select the student who will receive this card.</p>
          </div>
          <button onClick={onCancel} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close assign dialog">
            <X size={19} />
          </button>
        </header>

        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950/60">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">RFID card number</p>
              <p className="mt-0.5 truncate font-mono text-sm font-bold text-slate-800 dark:text-slate-100">{card.cardNumber}</p>
            </div>
            <RFIDStatusBadge status={card.status} />
          </div>

          <label className="relative mt-4 block">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search student ID, name, course, year, or section…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800" aria-label="Clear student search">
                <X size={14} />
              </button>
            )}
          </label>

          <div className="mt-3 max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700">
            {studentsLoading ? (
              <p className="flex items-center justify-center gap-2 px-4 py-8 text-xs text-slate-400"><LoaderCircle size={16} className="animate-spin text-blue-600" />Loading students…</p>
            ) : studentsError ? (
              <p className="flex items-center justify-center gap-2 px-4 py-8 text-xs text-rose-600"><AlertCircle size={16} />Students could not be loaded.</p>
            ) : filtered.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-slate-400">No students found.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((student) => {
                  const unavailable = unavailableStudentIds.has(student.id)
                  const isSelected = selected?.id === student.id
                  return (
                    <li key={student.id}>
                      <button
                        type="button"
                        disabled={unavailable}
                        onClick={() => setSelected(student)}
                        aria-pressed={isSelected}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${isSelected ? 'bg-blue-50 dark:bg-blue-500/10' : unavailable ? 'cursor-not-allowed opacity-45' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}
                      >
                        <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-[10px] font-bold ${student.avatarColor}`}>{initials(student.name)}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold text-slate-700 dark:text-slate-200">{student.name}</span>
                          <span className="mt-0.5 block font-mono text-[10px] text-slate-400">{student.studentId}</span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-300">{student.courseCode}</span>
                          <span className="mt-0.5 block text-[10px] text-slate-400">{student.yearLevel} · {student.section}</span>
                        </span>
                        {unavailable && <span className="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">Has active card</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {selected && (
            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Selected student</p>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs sm:grid-cols-3">
                <div>
                  <dt className="text-[10px] text-slate-400">Student ID</dt>
                  <dd className="mt-0.5 font-mono font-semibold text-slate-700 dark:text-slate-200">{selected.studentId}</dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-400">Student name</dt>
                  <dd className="mt-0.5 font-semibold text-slate-700 dark:text-slate-200">{selected.name}</dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-400">Course</dt>
                  <dd className="mt-0.5 font-semibold text-slate-700 dark:text-slate-200">{selected.courseCode} · {selected.course.replace('BS ', '')}</dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-400">Year</dt>
                  <dd className="mt-0.5 font-semibold text-slate-700 dark:text-slate-200">{selected.yearLevel}</dd>
                </div>
                <div>
                  <dt className="text-[10px] text-slate-400">Section</dt>
                  <dd className="mt-0.5 font-semibold text-slate-700 dark:text-slate-200">{selected.section}</dd>
                </div>
              </dl>
            </div>
          )}

          <p className="mt-3 text-[10px] text-slate-400">A student can only hold one active RFID card at a time.</p>
        </div>

        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-slate-800 sm:px-6">
          <button onClick={onCancel} disabled={loading} className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800">
            Cancel
          </button>
          <button
            onClick={() => { if (selected) onConfirm(selected) }}
            disabled={!selected || loading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <LoaderCircle size={14} className="animate-spin" /> : <UserPlus size={14} />}Assign card
          </button>
        </footer>
      </section>
    </div>
  )
}
