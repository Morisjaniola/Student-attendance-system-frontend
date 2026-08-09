import { AlertCircle, CircleCheck, CircleX, Clock3, LoaderCircle, ScanLine } from 'lucide-react'
import type { AttendanceValidationResult } from '../../types/attendance'

interface StudentValidationCardProps {
  result: AttendanceValidationResult | null
  busy: boolean
}

export function StudentValidationCard({ result, busy }: StudentValidationCardProps) {
  let content

  if (result?.outcome === 'success') {
    const { student } = result.record
    content = (
      <>
        <div className="flex items-center gap-3">
          <span className={`grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl text-xs font-bold ${student.avatarColor}`}>
            {student.photo ? <img src={student.photo} alt="" className="size-full object-cover" /> : student.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{student.name}</p>
            <p className="font-mono text-[11px] text-slate-400">{student.studentId}</p>
          </div>
          <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CircleCheck size={12} />Valid
          </span>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-slate-50 p-4 text-xs dark:bg-slate-950/60">
          <div>
            <dt className="text-[10px] text-slate-400">Course</dt>
            <dd className="mt-0.5 font-semibold text-slate-700 dark:text-slate-200">{student.courseCode} · {student.course.replace('BS ', '')}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-slate-400">Year</dt>
            <dd className="mt-0.5 font-semibold text-slate-700 dark:text-slate-200">{student.yearLevel}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-slate-400">Section</dt>
            <dd className="mt-0.5 font-semibold text-slate-700 dark:text-slate-200">{student.section}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-slate-400">Method</dt>
            <dd className="mt-0.5 font-semibold text-slate-700 dark:text-slate-200">{result.record.method}</dd>
          </div>
        </dl>
      </>
    )
  } else if (result?.outcome === 'invalid') {
    content = (
      <div className="text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
          <CircleX size={24} />
        </span>
        <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100">Invalid scan</h3>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{result.message}</p>
        <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-600 ring-1 ring-inset ring-rose-600/15 dark:bg-rose-500/10 dark:text-rose-300">
          <AlertCircle size={12} />No attendance record was created.
        </p>
      </div>
    )
  } else if (result?.outcome === 'duplicate') {
    const { previous } = result
    content = (
      <div className="text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
          <Clock3 size={24} />
        </span>
        <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100">Attendance already recorded</h3>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">This student already checked in for today's session.</p>
        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-left text-xs dark:bg-slate-950/60">
          <p className="font-semibold text-slate-700 dark:text-slate-200">{previous.student.name}</p>
          <p className="mt-1.5 flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Previous time</span><span className="font-semibold text-slate-600 dark:text-slate-300">{previous.time}</span>
          </p>
          <p className="mt-1 flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>Method</span><span className="font-semibold text-slate-600 dark:text-slate-300">{previous.method}</span>
          </p>
        </div>
      </div>
    )
  } else if (busy) {
    content = (
      <div className="text-center">
        <LoaderCircle size={26} className="mx-auto animate-spin text-blue-600" />
        <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100">Validating student…</h3>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Checking student status and credential assignment.</p>
      </div>
    )
  } else {
    content = (
      <div className="text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
          <ScanLine size={24} />
        </span>
        <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100">Waiting for a scan</h3>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Scan a QR code or an RFID card to validate and record attendance.</p>
      </div>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Student Validation</h2>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${result?.outcome === 'success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : result?.outcome === 'invalid' ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300' : result?.outcome === 'duplicate' ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'}`}>
          <span className={`size-1.5 rounded-full ${result?.outcome === 'success' ? 'bg-emerald-500' : result?.outcome === 'invalid' ? 'bg-rose-500' : result?.outcome === 'duplicate' ? 'bg-amber-500' : busy ? 'animate-pulse bg-blue-500' : 'bg-slate-400'}`} />
          {result?.outcome === 'success' ? 'SUCCESS' : result?.outcome === 'invalid' ? 'INVALID' : result?.outcome === 'duplicate' ? 'DUPLICATE' : busy ? 'VALIDATING' : 'READY'}
        </span>
      </div>
      <div className="mt-4">{content}</div>
    </section>
  )
}
