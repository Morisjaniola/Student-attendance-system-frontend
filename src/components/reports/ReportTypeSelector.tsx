import { CalendarDays, CalendarRange, FileText, GraduationCap, UsersRound } from 'lucide-react'
import type { ReportType } from '../../types/report'

const reportTypes: { type: ReportType; label: string; description: string; icon: typeof CalendarDays }[] = [
  { type: 'daily', label: 'Daily', description: 'A selected date', icon: CalendarDays },
  { type: 'weekly', label: 'Weekly', description: 'A date range', icon: CalendarRange },
  { type: 'monthly', label: 'Monthly', description: 'A selected month', icon: FileText },
  { type: 'student', label: 'Student', description: 'One student history', icon: GraduationCap },
  { type: 'course', label: 'Course', description: 'Course attendance', icon: UsersRound },
]

interface ReportTypeSelectorProps {
  value: ReportType
  onChange: (type: ReportType) => void
}

export function ReportTypeSelector({ value, onChange }: ReportTypeSelectorProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5" aria-label="Report type">
      {reportTypes.map(({ type, label, description, icon: Icon }) => {
        const active = value === type
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${active
              ? 'border-blue-200 bg-blue-50 text-blue-700 ring-1 ring-blue-600/10 dark:border-blue-500/35 dark:bg-blue-500/10 dark:text-blue-300'
              : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800'}`}
          >
            <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'}`}><Icon size={17} /></span>
            <span><span className="block text-xs font-bold">{label}</span><span className="mt-0.5 block text-[10px] font-medium opacity-70">{description}</span></span>
          </button>
        )
      })}
    </div>
  )
}
