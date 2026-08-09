import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, LoaderCircle, Search, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { fromTimeInput, toTimeInput } from '../../services/attendanceRecordsService'
import type { AttendanceMethod, AttendanceStatus } from '../../types/dashboard'
import type { AttendanceRecord } from '../../types/attendanceRecord'
import type { Student } from '../../types/student'
import { initials } from '../../utils/format'
import { AttendanceMethodBadge, AttendanceStatusBadge } from './AttendanceBadges'

const baseFieldClass = 'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 dark:disabled:bg-slate-950/40'

const fieldClass = `${baseFieldClass} mt-1.5`

const editSchema = z.object({
  studentId: z.string().min(1, 'Select a student.'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Select a valid date.'),
  time: z.string(),
  status: z.enum(['Present', 'Late', 'Excused', 'Absent']),
  method: z.enum(['QR Code', 'RFID']),
}).superRefine((values, context) => {
  const noCheckIn = values.status === 'Absent' || values.status === 'Excused'
  if (!noCheckIn && !/^\d{2}:\d{2}$/.test(values.time)) {
    context.addIssue({ code: 'custom', path: ['time'], message: 'Select a valid time.' })
  }
})

type EditFormValues = z.infer<typeof editSchema>

export interface AttendanceEditValues {
  student: Student
  date: string
  time: string
  status: AttendanceStatus
  method: AttendanceMethod
}

interface EditAttendanceModalProps {
  open: boolean
  record: AttendanceRecord | null
  /** Full student list; only Active students are selectable in the picker. */
  students: Student[]
  studentsLoading: boolean
  studentsError: boolean
  loading: boolean
  onSave: (recordId: string, values: AttendanceEditValues) => void
  onCancel: () => void
}

const STATUS_OPTIONS: AttendanceStatus[] = ['Present', 'Late', 'Excused', 'Absent']
const METHOD_OPTIONS: AttendanceMethod[] = ['QR Code', 'RFID']

export function EditAttendanceModal({ open, record, students, studentsLoading, studentsError, loading, onSave, onCancel }: EditAttendanceModalProps) {
  const [search, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const form = useForm<EditFormValues>({ resolver: zodResolver(editSchema), defaultValues: { studentId: '', date: '', time: '07:30', status: 'Present', method: 'QR Code' } })

  // Reset the form once per record opened.
  useEffect(() => {
    if (!open || !record) return
    form.reset({
      studentId: record.student.id,
      date: record.date,
      time: toTimeInput(record.time),
      status: record.status,
      method: record.method,
    })
    setSearch('')
    setSelectedStudent(null)
  }, [form, open, record])

  // Preselect the record's student once the picker list is available.
  useEffect(() => {
    if (!open || !record) return
    const match = students.find((student) => student.id === record.student.id)
    if (match) setSelectedStudent((current) => current ?? match)
  }, [open, record, students])

  const watchedStatus = form.watch('status')
  const noCheckIn = watchedStatus === 'Absent' || watchedStatus === 'Excused'

  const selectableStudents = useMemo(() => students.filter((student) => student.status === 'Active'), [students])

  const filtered = useMemo(() => {
    const value = search.trim().toLowerCase()
    if (!value) return selectableStudents
    return selectableStudents.filter((student) => [student.studentId, student.firstName, student.lastName, student.courseCode, student.yearLevel, student.section].join(' ').toLowerCase().includes(value))
  }, [search, selectableStudents])

  if (!open || !record) return null

  const submit = (values: EditFormValues) => {
    const time = noCheckIn ? '—' : fromTimeInput(values.time)
    const student = selectedStudent
    if (!student) return
    onSave(record.id, { student, date: values.date, time, status: values.status, method: values.method })
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 p-0 backdrop-blur-sm sm:p-5">
      <section role="dialog" aria-modal="true" aria-labelledby="edit-attendance-title" className="mx-auto min-h-full w-full max-w-lg bg-white shadow-2xl dark:bg-slate-900 sm:min-h-0 sm:rounded-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
          <div>
            <h2 id="edit-attendance-title" className="text-lg font-bold text-slate-900 dark:text-white">Edit attendance record</h2>
            <p className="mt-1 text-xs text-slate-400">Update the student, schedule, status, or method for this record.</p>
          </div>
          <button onClick={onCancel} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close edit dialog">
            <X size={19} />
          </button>
        </header>

        <form onSubmit={form.handleSubmit(submit)} className="p-5 sm:p-6">
          <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950/60">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Editing record</p>
            <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-100">
              {record.student.name} <span className="ml-1 font-mono text-[11px] font-medium text-slate-400">{record.student.studentId}</span>
            </p>
            <div className="mt-2 flex items-center gap-2">
              <AttendanceStatusBadge status={record.status} />
              <AttendanceMethodBadge method={record.method} />
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Student</p>
            <label className="relative mt-1.5 block">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                name="studentSearch"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search student ID, name, course, or section…"
                aria-label="Search students"
                className={`${baseFieldClass} pl-9 pr-9`}
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800" aria-label="Clear student search">
                  <X size={14} />
                </button>
              )}
            </label>
          </div>

          <div className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700">
            {studentsLoading ? (
              <p className="flex items-center justify-center gap-2 px-4 py-6 text-xs text-slate-400"><LoaderCircle size={16} className="animate-spin text-blue-600" />Loading students…</p>
            ) : studentsError ? (
              <p className="flex items-center justify-center gap-2 px-4 py-6 text-xs text-rose-600"><AlertCircle size={16} />Students could not be loaded.</p>
            ) : filtered.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-slate-400">No active students found.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((student) => {
                  const isSelected = selectedStudent?.id === student.id
                  return (
                    <li key={student.id}>
                      <button
                        type="button"
                        onClick={() => { setSelectedStudent(student); form.setValue('studentId', student.id, { shouldValidate: true }) }}
                        aria-pressed={isSelected}
                        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${isSelected ? 'bg-blue-50 dark:bg-blue-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}
                      >
                        <span className={`grid size-8 shrink-0 place-items-center rounded-lg text-[10px] font-bold ${student.avatarColor}`}>{initials(`${student.firstName} ${student.lastName}`)}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold text-slate-700 dark:text-slate-200">{student.firstName} {student.middleName ? `${student.middleName[0]}. ` : ''}{student.lastName}</span>
                          <span className="mt-0.5 block font-mono text-[10px] text-slate-400">{student.studentId}</span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-300">{student.courseCode}</span>
                          <span className="mt-0.5 block text-[10px] text-slate-400">{student.yearLevel} · {student.section}</span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
          {form.formState.errors.studentId && <p className="mt-1 text-[10px] font-medium text-rose-600">{form.formState.errors.studentId.message}</p>}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
              Date
              <input type="date" {...form.register('date')} className={fieldClass} />
              {form.formState.errors.date && <p className="mt-1 text-[10px] font-medium text-rose-600">{form.formState.errors.date.message}</p>}
            </label>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
              Time
              <input
                type="time"
                {...form.register('time')}
                disabled={noCheckIn}
                className={fieldClass}
              />
              {noCheckIn ? (
                <p className="mt-1 text-[10px] text-slate-400">No check-in time for {watchedStatus.toLowerCase()} records.</p>
              ) : (
                form.formState.errors.time && <p className="mt-1 text-[10px] font-medium text-rose-600">{form.formState.errors.time.message}</p>
              )}
            </label>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
              Status
              <select {...form.register('status')} className={fieldClass + ' appearance-none'}>
                {STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}
              </select>
              {form.formState.errors.status && <p className="mt-1 text-[10px] font-medium text-rose-600">{form.formState.errors.status.message}</p>}
            </label>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
              Attendance method
              <select {...form.register('method')} className={fieldClass + ' appearance-none'}>
                {METHOD_OPTIONS.map((method) => <option key={method}>{method}</option>)}
              </select>
              {form.formState.errors.method && <p className="mt-1 text-[10px] font-medium text-rose-600">{form.formState.errors.method.message}</p>}
            </label>
          </div>

          <footer className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={onCancel} disabled={loading} className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60">
              {loading && <LoaderCircle size={14} className="animate-spin" />}
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}
