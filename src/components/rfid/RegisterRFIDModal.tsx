import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Check, LoaderCircle, Plus, RefreshCw, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { rfidService } from '../../services/rfidService'
import type { RFIDAssignStudent } from '../../types/rfid'
import { fieldClass } from '../../utils/formStyles'
import { initials } from '../../utils/format'

const registerSchema = z.object({
  cardNumber: z.string().trim().min(1, 'RFID card number is required.').max(30, 'RFID card number must be 30 characters or fewer.'),
})

const fieldClassWithMargin = `${fieldClass} mt-1.5`

interface RegisterRFIDModalProps {
  open: boolean
  existingCardNumbers: string[]
  students: RFIDAssignStudent[]
  /** Student IDs that already hold an active RFID card. */
  unavailableStudentIds: Set<string>
  studentsLoading: boolean
  studentsError: boolean
  loading: boolean
  onConfirm: (cardNumber: string, student?: RFIDAssignStudent) => void
  onCancel: () => void
}

export function RegisterRFIDModal({ open, existingCardNumbers, students, unavailableStudentIds, studentsLoading, studentsError, loading, onConfirm, onCancel }: RegisterRFIDModalProps) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<RFIDAssignStudent | null>(null)
  const [generating, setGenerating] = useState(false)
  const form = useForm({ resolver: zodResolver(registerSchema), defaultValues: { cardNumber: '' } })

  // Determine if the selected student already has an RFID number.
  const studentHasExistingRfid = Boolean(selected?.rfidNumber)
  const existingRfidAlreadyRegistered = selected?.rfidNumber
    ? existingCardNumbers.some((cn) => cn.toLowerCase() === selected.rfidNumber.toLowerCase())
    : false
  const fieldReadOnly = generating || (studentHasExistingRfid && !existingRfidAlreadyRegistered)

  // When the modal opens, reset state. Do NOT auto-generate — generation
  // happens only when a student without an RFID is selected.
  useEffect(() => {
    if (!open) return
    setSelected(null)
    setSearch('')
    form.setValue('cardNumber', '', { shouldDirty: false, shouldValidate: false })
  }, [open, form])

  // When a student is selected, populate the RFID field accordingly:
  //  - Student has rfidNumber → use it (read-only)
  //  - Student has no rfidNumber → generate a new unique one
  useEffect(() => {
    if (!open || !selected) return

    if (selected.rfidNumber) {
      // Student already has an RFID — use it directly.
      form.setValue('cardNumber', selected.rfidNumber, { shouldDirty: true, shouldValidate: true })
    } else {
      // Student has no RFID — generate a fresh one.
      setGenerating(true)
      rfidService
        .generateUniqueCardNumber()
        .then((number) => {
          form.setValue('cardNumber', number, { shouldDirty: true, shouldValidate: true })
        })
        .catch(() => {
          form.setValue('cardNumber', '')
        })
        .finally(() => setGenerating(false))
    }
  }, [open, selected, form])

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase()
    if (!value) return students
    return students.filter((student) =>
      [student.studentId, student.name, student.courseCode, student.course, student.yearLevel, student.section]
        .join(' ')
        .toLowerCase()
        .includes(value),
    )
  }, [search, students])

  if (!open) return null

  const submit = (values: { cardNumber: string }) => {
    const number = values.cardNumber.trim()

    // If the student already has an RFID and it's already registered as a
    // card, there is nothing new to register.
    if (existingRfidAlreadyRegistered) {
      form.setError('cardNumber', { message: 'This student already has an RFID card registered.' })
      return
    }

    // General duplicate check against existing card records.
    if (existingCardNumbers.some((existing) => existing.toLowerCase() === number.toLowerCase())) {
      form.setError('cardNumber', { message: 'This RFID card number is already registered.' })
      return
    }
    onConfirm(number, selected ?? undefined)
  }

  const refreshNumber = async () => {
    setGenerating(true)
    try {
      const number = await rfidService.generateUniqueCardNumber()
      form.setValue('cardNumber', number, { shouldDirty: true, shouldValidate: true })
    } catch {
      // keep current value on failure
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 p-0 backdrop-blur-sm sm:p-5">
      <section role="dialog" aria-modal="true" aria-labelledby="register-rfid-title" className="mx-auto min-h-full w-full max-w-lg bg-white shadow-2xl dark:bg-slate-900 sm:min-h-0 sm:rounded-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
          <div>
            <h2 id="register-rfid-title" className="text-lg font-bold text-slate-900 dark:text-white">Register RFID card</h2>
            <p className="mt-1 text-xs text-slate-400">Register a new RFID card and optionally assign it to a student.</p>
          </div>
          <button onClick={onCancel} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close register dialog">
            <X size={19} />
          </button>
        </header>

        <form onSubmit={form.handleSubmit(submit)} className="p-5 sm:p-6">
          {/* ── Student selector ─────────────────────────────────────────── */}
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
            Student <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <div className="relative mt-1.5">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search or select student…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800" aria-label="Clear student search">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700">
            {studentsLoading ? (
              <p className="flex items-center justify-center gap-2 px-4 py-6 text-xs text-slate-400"><LoaderCircle size={16} className="animate-spin text-blue-600" />Loading students…</p>
            ) : studentsError ? (
              <p className="flex items-center justify-center gap-2 px-4 py-6 text-xs text-rose-600"><AlertCircle size={16} />Students could not be loaded.</p>
            ) : filtered.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-slate-400">No students found.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((student) => {
                  const unavailable = unavailableStudentIds.has(student.studentId) || unavailableStudentIds.has(student.id)
                  const isSelected = selected?.id === student.id
                  return (
                    <li key={student.id}>
                      <button
                        type="button"
                        disabled={unavailable}
                        onClick={() => setSelected(isSelected ? null : student)}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${isSelected ? 'bg-blue-50 dark:bg-blue-500/10' : unavailable ? 'cursor-not-allowed opacity-45' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}
                      >
                        <span className={`grid size-8 shrink-0 place-items-center rounded-xl text-[10px] font-bold ${student.avatarColor}`}>{initials(student.name)}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold text-slate-700 dark:text-slate-200">{student.name}</span>
                          <span className="mt-0.5 block font-mono text-[10px] text-slate-400">{student.studentId}</span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-300">{student.courseCode}</span>
                          <span className="mt-0.5 block text-[10px] text-slate-400">{student.yearLevel} · {student.section}</span>
                        </span>
                        {unavailable ? (
                          <span className="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">Has active card</span>
                        ) : student.rfidNumber ? (
                          <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">Has RFID</span>
                        ) : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {selected && (
            <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-2 dark:border-blue-500/20 dark:bg-blue-500/10">
              <p className="text-[10px] text-blue-600 dark:text-blue-400">
                Selected: <span className="font-bold">{selected.name}</span> — {selected.studentId}
              </p>
            </div>
          )}

          {/* ── RFID card number ────────────────────────────────────────── */}
          <label className="mt-4 block text-[11px] font-bold text-slate-600 dark:text-slate-300">
            RFID card number
            <div className="mt-1.5 flex items-center gap-1.5">
              <input
                {...form.register('cardNumber')}
                placeholder="XX:XX:XX:XX:XX"
                readOnly={fieldReadOnly}
                className={`${fieldClass} flex-1 ${fieldReadOnly ? 'cursor-default bg-slate-50 dark:bg-slate-900/60' : ''}`}
              />
              {!studentHasExistingRfid && (
                <button
                  type="button"
                  onClick={() => void refreshNumber()}
                  disabled={generating}
                  title="Generate a new RFID number"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
                >
                  <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
                </button>
              )}
            </div>
            {form.formState.errors.cardNumber && <p className="mt-1 text-[10px] font-medium text-rose-600">{form.formState.errors.cardNumber.message}</p>}
          </label>

          {/* ── Contextual helper text ───────────────────────────────────── */}
          {existingRfidAlreadyRegistered ? (
            <p className="mt-2 flex items-center gap-1.5 text-[10px] leading-5 text-blue-600 dark:text-blue-400">
              <Check size={12} className="shrink-0" />
              This student already has an RFID card registered — <span className="font-mono font-bold">{selected?.rfidNumber}</span>.
            </p>
          ) : studentHasExistingRfid ? (
            <p className="mt-2 flex items-center gap-1.5 text-[10px] leading-5 text-amber-600 dark:text-amber-400">
              <AlertCircle size={12} className="shrink-0" />
              Using this student&apos;s existing RFID — <span className="font-mono font-bold">{selected?.rfidNumber}</span>. No new number will be generated.
            </p>
          ) : selected ? (
            <p className="mt-2 text-[10px] leading-5 text-slate-400">A new unique RFID will be generated and assigned to this student.</p>
          ) : (
            <p className="mt-2 text-[10px] leading-5 text-slate-400">Select a student to auto-fill their RFID, or generate a new card number.</p>
          )}

          <footer className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={onCancel} disabled={loading} className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800">
              Cancel
            </button>
            <button type="submit" disabled={loading || generating || existingRfidAlreadyRegistered} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60">
              {loading ? <LoaderCircle size={14} className="animate-spin" /> : <Plus size={14} />}Register card
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}
