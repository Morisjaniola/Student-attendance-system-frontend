import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, CalendarDays, ChevronDown, Download, FileDown, FileSpreadsheet, FileText, Scale } from 'lucide-react'
import type { AttendanceRecord } from '../../types/attendance'
import type { AnalyticsFilters, AttendanceHealth, DatePreset, PresentAbsentDetail } from '../../types/analytics'
import { formatNumber } from '../../utils/format'
import { exportAnalyticsCSV, exportAnalyticsExcel, exportAnalyticsPDF } from '../../utils/analyticsExport'
import { AttendanceDrillDownModal } from './AttendanceDrillDownModal'

// ---------------------------------------------------------------------------
// Date range preset selector.
// ---------------------------------------------------------------------------

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'Today', label: 'Today' },
  { value: 'This Week', label: 'This Week' },
  { value: 'This Month', label: 'This Month' },
  { value: 'Custom', label: 'Custom Range' },
]

function DatePresetSelect({ value, onChange }: { value: DatePreset; onChange: (v: DatePreset) => void }) {
  const [open, setOpen] = useState(false)
  const selected = DATE_PRESETS.find((p) => p.value === value)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <CalendarDays size={13} className="text-blue-600 dark:text-blue-400" />
        {selected?.label}
        <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul role="listbox" className="absolute right-0 z-20 mt-1.5 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          {DATE_PRESETS.map((preset) => (
            <li key={preset.value}>
              <button
                type="button"
                role="option"
                aria-selected={preset.value === value}
                onClick={() => { onChange(preset.value); setOpen(false) }}
                className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium transition-colors ${
                  preset.value === value
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {preset.label}
                {preset.value === value && <span className="size-1.5 rounded-full bg-blue-600" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Export dropdown (inside the card header).
// ---------------------------------------------------------------------------

function ExportMenu({ records, label }: { records: AttendanceRecord[]; label: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={!records.length}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Download size={13} />
        Export
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-30 mt-1.5 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <button type="button" role="menuitem" onClick={() => { setOpen(false); exportAnalyticsExcel(records, label) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
            <FileSpreadsheet size={14} className="text-emerald-600" /><span><span className="block">Excel (.xlsx)</span><span className="mt-0.5 block text-[10px] font-normal text-slate-400">Spreadsheet export</span></span>
          </button>
          <button type="button" role="menuitem" onClick={() => { setOpen(false); exportAnalyticsPDF(records, label) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
            <FileText size={14} className="text-rose-600" /><span><span className="block">PDF (.pdf)</span><span className="mt-0.5 block text-[10px] font-normal text-slate-400">Print-ready report</span></span>
          </button>
          <button type="button" role="menuitem" onClick={() => { setOpen(false); exportAnalyticsCSV(records, label) }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">
            <FileDown size={14} className="text-blue-600" /><span><span className="block">CSV (.csv)</span><span className="mt-0.5 block text-[10px] font-normal text-slate-400">Comma-separated values</span></span>
          </button>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Health indicator badge.
// ---------------------------------------------------------------------------

function HealthBadge({ health }: { health: AttendanceHealth }) {
  const colorMap = {
    Good: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300',
    'Needs Attention': 'bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-500/10 dark:text-amber-300',
    Critical: 'bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-500/10 dark:text-rose-300',
  }
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950">
      <Activity size={14} className={health.level === 'Good' ? 'text-emerald-500' : health.level === 'Needs Attention' ? 'text-amber-500' : 'text-rose-500'} />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Attendance Health</p>
        <p className="mt-0.5 flex items-center gap-1.5">
          <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-bold ring-1 ring-inset ${colorMap[health.level]}`}>
            {health.level}
          </span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{health.percentage}%</span>
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Period comparison delta badge.
// ---------------------------------------------------------------------------

function DeltaBadge({ delta, label }: { delta: number | null; label: string }) {
  if (delta === null) {
    return <span className="text-[10px] text-slate-400">No prior data</span>
  }
  const isUp = delta > 0
  const isDown = delta < 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${isUp ? 'text-emerald-600 dark:text-emerald-400' : isDown ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
      {isUp ? '↑' : isDown ? '↓' : '—'} {Math.abs(delta)}% {label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Chart tooltip.
// ---------------------------------------------------------------------------

function ComparisonTooltip({ active, payload, presentPercentage, absentPercentage }: {
  active?: boolean
  payload?: ReadonlyArray<{ value?: number; name?: string; payload?: { fill?: string } }>
  presentPercentage: number
  absentPercentage: number
}) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  const value = Number(entry.value) || 0
  const isPresent = entry.name === 'Present'
  const pct = isPresent ? presentPercentage : absentPercentage
  return (
    <div className="min-w-36 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-3 text-xs shadow-xl" style={{ pointerEvents: 'none' }}>
      <p className="font-bold text-slate-100">{entry.name}</p>
      <div className="mt-1.5 flex items-center justify-between gap-4">
        <span className="text-slate-400">Records</span>
        <span className="font-bold text-slate-200">{formatNumber(value)}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-400">Percentage</span>
        <span className="font-bold text-blue-400">{pct}%</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main chart card.
// ---------------------------------------------------------------------------

export interface AttendanceComparisonChartProps {
  comparisonDetail: PresentAbsentDetail
  health: AttendanceHealth
  records: AttendanceRecord[]
  courses: string[]
  sections: string[]
  datePreset: DatePreset
  filters: AnalyticsFilters
  onDatePresetChange: (preset: DatePreset) => void
  onFilterChange: (patch: Partial<AnalyticsFilters>) => void
}

export function AttendanceComparisonChart({
  comparisonDetail,
  health,
  records,
  courses,
  sections,
  datePreset,
  filters,
  onDatePresetChange,
  onFilterChange,
}: AttendanceComparisonChartProps) {
  const [presentModalOpen, setPresentModalOpen] = useState(false)
  const [absentModalOpen, setAbsentModalOpen] = useState(false)

  const { present, absent, presentPercentage, absentPercentage, total, presentDelta, absentDelta } = comparisonDetail

  const chartData = useMemo(() => [
    { name: 'Present', value: present, fill: '#10b981' },
    { name: 'Absent', value: absent, fill: '#f43f5e' },
  ], [present, absent])

  const presentRecords = useMemo(() => records.filter((r) => r.status === 'Present'), [records])
  const absentRecords = useMemo(() => records.filter((r) => r.status === 'Absent'), [records])

  const isCustom = datePreset === 'Custom'
  const selectedCourse = filters.course
  const selectedSection = filters.section

  // Sections available for the currently selected course (filter from all records).
  const availableSections = useMemo(() => {
    if (selectedCourse === 'All') return sections
    const s = new Set<string>()
    for (const r of records) {
      if (r.student.courseCode === selectedCourse) s.add(r.student.section)
    }
    // Fall back to the global section list if no records match the course yet.
    return s.size > 0 ? [...s].sort() : sections
  }, [selectedCourse, sections, records])

  return (
    <>
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Present vs Absent</h2>
            <p className="mt-1 text-xs text-slate-400">Comparison of present and absent attendance records</p>
          </div>
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
            <Scale size={18} />
          </span>
        </div>

        {/* Inline filters: Date presets + Course + Section */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <DatePresetSelect value={datePreset} onChange={onDatePresetChange} />

          <select
            value={selectedCourse}
            onChange={(e) => {
              const course = e.target.value
              onFilterChange({ course, section: 'All' })
            }}
            className="h-8 appearance-none rounded-lg border border-slate-200 bg-white px-2.5 pr-7 text-[11px] font-semibold text-slate-600 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: 'right 6px center', backgroundRepeat: 'no-repeat' }}
          >
            <option value="All">All Courses</option>
            {courses.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={selectedSection}
            onChange={(e) => onFilterChange({ section: e.target.value })}
            className="h-8 appearance-none rounded-lg border border-slate-200 bg-white px-2.5 pr-7 text-[11px] font-semibold text-slate-600 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundPosition: 'right 6px center', backgroundRepeat: 'no-repeat' }}
          >
            <option value="All">All Sections</option>
            {availableSections.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <ExportMenu records={records} label="Present vs Absent" />
        </div>

        {/* Custom date range inputs */}
        {isCustom && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onFilterChange({ dateFrom: e.target.value })}
              aria-label="From date"
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-600 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onFilterChange({ dateTo: e.target.value })}
              aria-label="To date"
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-600 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            />
          </div>
        )}

        {/* Health indicator */}
        <div className="mt-4">
          <HealthBadge health={health} />
        </div>

        {/* Clickable Present / Absent summary cards */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {/* Present card */}
          <button
            type="button"
            onClick={() => setPresentModalOpen(true)}
            className="group rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-left transition hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-100/50 dark:border-emerald-900/50 dark:bg-emerald-500/5 dark:hover:border-emerald-700"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Present</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-300">{formatNumber(present)}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{presentPercentage}%</span>
              <DeltaBadge delta={presentDelta} label="vs previous period" />
            </div>
            <p className="mt-1.5 text-[10px] text-emerald-500/70 dark:text-emerald-400/50">Click to view students →</p>
          </button>

          {/* Absent card */}
          <button
            type="button"
            onClick={() => setAbsentModalOpen(true)}
            className="group rounded-xl border border-rose-200 bg-rose-50/60 p-3 text-left transition hover:border-rose-300 hover:shadow-md hover:shadow-rose-100/50 dark:border-rose-900/50 dark:bg-rose-500/5 dark:hover:border-rose-700"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">Absent</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-rose-700 dark:text-rose-300">{formatNumber(absent)}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{absentPercentage}%</span>
              <DeltaBadge delta={absentDelta} label="vs previous period" />
            </div>
            <p className="mt-1.5 text-[10px] text-rose-500/70 dark:text-rose-400/50">Click to view students →</p>
          </button>
        </div>

        {/* Bar chart */}
        <div className="mt-5 h-56" aria-label="Present vs absent bar chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -22, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.25)" strokeDasharray="3 3" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                cursor={{ fill: 'rgba(148,163,184,0.12)' }}
                content={<ComparisonTooltip presentPercentage={presentPercentage} absentPercentage={absentPercentage} />}
              />
              <Bar dataKey="value" name="Records" radius={[6, 6, 0, 0]} background={false}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} activeFill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Footer legend */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
          <span className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
            <i className="size-2 rounded-full bg-emerald-500" />
            Present: <span className="font-bold text-slate-900 dark:text-white">{formatNumber(present)}</span>
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
            <i className="size-2 rounded-full bg-rose-500" />
            Absent: <span className="font-bold text-slate-900 dark:text-white">{formatNumber(absent)}</span>
          </span>
          <span className="ml-auto text-slate-400">
            {total > 0 ? `${presentPercentage}% of records are present` : 'No present or absent records'}
          </span>
        </div>
      </section>

      {/* Drill-down modals */}
      <AttendanceDrillDownModal
        open={presentModalOpen}
        title="Present Students"
        records={presentRecords}
        onClose={() => setPresentModalOpen(false)}
      />
      <AttendanceDrillDownModal
        open={absentModalOpen}
        title="Absent Students"
        records={absentRecords}
        onClose={() => setAbsentModalOpen(false)}
      />
    </>
  )
}
