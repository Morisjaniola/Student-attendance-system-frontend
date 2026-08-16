import { ArrowDownAZ, ArrowUpAZ, CalendarDays } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useFormatPreferences } from '../../hooks/useFormatting'
import type { AttendanceRecord } from '../../types/attendance'
import type { ReportType } from '../../types/report'
import type { DateFormat, TimeFormat } from '../../types/settings'
import { formatDate, formatTime, initials } from '../../utils/format'
import { AttendanceStatusBadge } from '../attendanceRecords/AttendanceBadges'

type SortKey = 'student' | 'course' | 'section' | 'date' | 'time' | 'status'
type SortDirection = 'asc' | 'desc'

const labels: Record<SortKey, string> = { student: 'Student', course: 'Course', section: 'Section', date: 'Date', time: 'Time', status: 'Status' }

interface ReportsTableProps {
  records: AttendanceRecord[]
  type: ReportType
}

export function ReportsTable({ records, type }: ReportsTableProps) {
  const { timeFormat, dateFormat } = useFormatPreferences()
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [direction, setDirection] = useState<SortDirection>('desc')

  const sorted = useMemo(() => [...records].sort((a, b) => {
    const aValue = sortKey === 'student' ? a.student.name : sortKey === 'course' ? a.student.courseCode : sortKey === 'section' ? a.student.section : a[sortKey]
    const bValue = sortKey === 'student' ? b.student.name : sortKey === 'course' ? b.student.courseCode : sortKey === 'section' ? b.student.section : b[sortKey]
    const comparison = aValue.localeCompare(bValue)
    return direction === 'asc' ? comparison : -comparison
  }), [direction, records, sortKey])

  const groupMode = type === 'course' ? 'course' : type === 'weekly' || type === 'monthly' ? 'date' : null
  const grouped = useMemo(() => {
    if (!groupMode) return [{ key: '', label: '', records: sorted }]
    const groups = new Map<string, AttendanceRecord[]>()
    sorted.forEach((record) => {
      const key = groupMode === 'date' ? record.date : `${record.student.courseCode} · ${record.student.section}`
      groups.set(key, [...(groups.get(key) ?? []), record])
    })
    return [...groups.entries()].map(([key, groupedRecords]) => ({ key, label: groupMode === 'date' ? groupedRecords[0].dateLabel : key, records: groupedRecords }))
  }, [groupMode, sorted])

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setDirection((value) => value === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setDirection('asc') }
  }

  const header = (key: SortKey) => <button type="button" onClick={() => toggleSort(key)} className="inline-flex items-center gap-1 transition hover:text-blue-600">{labels[key]}{sortKey === key ? direction === 'asc' ? <ArrowUpAZ size={12} /> : <ArrowDownAZ size={12} /> : null}</button>

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left">
          <thead className="bg-slate-50/95 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:bg-slate-950/95"><tr><th className="px-5 py-3">{header('student')}</th><th className="px-3 py-3">Student ID</th><th className="px-3 py-3">{header('course')}</th><th className="px-3 py-3">{header('section')}</th><th className="px-3 py-3">{header('date')}</th><th className="px-3 py-3">{header('time')}</th><th className="px-5 py-3">{header('status')}</th></tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {grouped.map((group) => <GroupRows key={group.key} group={group} showHeading={Boolean(groupMode)} timeFormat={timeFormat} dateFormat={dateFormat} />)}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function GroupRows({ group, showHeading, timeFormat, dateFormat }: { group: { key: string; label: string; records: AttendanceRecord[] }; showHeading: boolean; timeFormat: TimeFormat; dateFormat: DateFormat }) {
  return <>
    {showHeading && <tr className="bg-slate-50/80 dark:bg-slate-950/60"><td colSpan={7} className="px-5 py-2.5 text-[11px] font-bold text-slate-600 dark:text-slate-300"><span className="inline-flex items-center gap-1.5"><CalendarDays size={13} className="text-blue-600" />{group.label}</span><span className="ml-2 font-medium text-slate-400">{group.records.length} record{group.records.length === 1 ? '' : 's'}</span></td></tr>}
    {group.records.map((record) => <tr key={record.id} className="text-xs text-slate-600 transition hover:bg-slate-50/80 dark:text-slate-300 dark:hover:bg-slate-800/40">
      <td className="px-5 py-3.5"><span className="flex items-center gap-2.5"><span className={`grid size-8 shrink-0 place-items-center overflow-hidden rounded-lg text-[10px] font-bold ${record.student.avatarColor}`}>{record.student.photo ? <img src={record.student.photo} alt="" className="size-full object-cover" /> : initials(record.student.name)}</span><span className="max-w-48 truncate font-semibold text-slate-700 dark:text-slate-200">{record.student.name}</span></span></td>
      <td className="px-3 py-3.5 font-mono text-[11px] text-slate-400">{record.student.studentId}</td><td className="px-3 py-3.5 font-semibold">{record.student.courseCode}</td><td className="px-3 py-3.5">{record.student.section}</td><td className="px-3 py-3.5 text-[11px] text-slate-400">{formatDate(record.date, dateFormat)}</td><td className="px-3 py-3.5 font-mono text-[11px] text-slate-500">{formatTime(record.time, timeFormat)}</td><td className="px-5 py-3.5"><AttendanceStatusBadge status={record.status} /></td>
    </tr>)}
  </>
}
