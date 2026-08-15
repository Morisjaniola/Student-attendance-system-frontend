import { CalendarRange, RotateCcw, SlidersHorizontal } from 'lucide-react'
import type { AttendanceStatus } from '../../types/dashboard'
import type { ReportFilters as ReportFiltersState, ReportOptions } from '../../types/report'

const fieldClass = 'mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
const labelClass = 'text-[11px] font-semibold text-slate-500'
const statuses: (AttendanceStatus | 'All')[] = ['All', 'Present', 'Absent', 'Late', 'Excused']

interface ReportFiltersProps {
  filters: ReportFiltersState
  options: ReportOptions
  onChange: <K extends keyof ReportFiltersState>(key: K, value: ReportFiltersState[K]) => void
  onReset: () => void
}

export function ReportFilters({ filters, options, onChange, onReset }: ReportFiltersProps) {
  const isRange = filters.type === 'weekly' || filters.type === 'student' || filters.type === 'course'
  const showStatus = filters.type === 'student' || filters.type === 'course'

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200"><SlidersHorizontal size={15} className="text-blue-600" />Report filters</span>
        <button type="button" onClick={onReset} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-bold text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"><RotateCcw size={13} />Reset</button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {filters.type === 'daily' && <label className={labelClass}>Date<input type="date" value={filters.date} onChange={(event) => onChange('date', event.target.value)} className={fieldClass} /></label>}
        {filters.type === 'monthly' && <label className={labelClass}>Month<input type="month" value={filters.month} onChange={(event) => onChange('month', event.target.value)} className={fieldClass} /></label>}
        {filters.type === 'student' && <label className={labelClass}>Student<select value={filters.studentId} onChange={(event) => onChange('studentId', event.target.value)} className={fieldClass}><option value="All">All students</option>{options.students.map((student) => <option key={student.id} value={student.id}>{student.name} ({student.studentId})</option>)}</select></label>}
        {filters.type === 'course' && <label className={labelClass}>Course<select value={filters.course} onChange={(event) => onChange('course', event.target.value)} className={fieldClass}><option value="All">All courses</option>{options.courses.map((course) => <option key={course} value={course}>{course}</option>)}</select></label>}
        {isRange && <label className={labelClass}><span className="flex items-center gap-1"><CalendarRange size={13} />Date range</span><span className="mt-1.5 flex gap-2"><input aria-label="Report start date" type="date" value={filters.dateFrom} onChange={(event) => onChange('dateFrom', event.target.value)} className={fieldClass.replace('mt-1.5 ', '')} /><input aria-label="Report end date" type="date" value={filters.dateTo} onChange={(event) => onChange('dateTo', event.target.value)} className={fieldClass.replace('mt-1.5 ', '')} /></span></label>}
        {filters.type === 'course' && <label className={labelClass}>Section<select value={filters.section} onChange={(event) => onChange('section', event.target.value)} className={fieldClass}><option value="All">All sections</option>{options.sections.map((section) => <option key={section} value={section}>{section}</option>)}</select></label>}
        {showStatus && <label className={labelClass}>Attendance status<select value={filters.status} onChange={(event) => onChange('status', event.target.value as ReportFiltersState['status'])} className={fieldClass}>{statuses.map((status) => <option key={status} value={status}>{status === 'All' ? 'All statuses' : status}</option>)}</select></label>}
      </div>
    </section>
  )
}
