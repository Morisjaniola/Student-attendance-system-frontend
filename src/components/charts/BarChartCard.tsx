import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpDown, BarChart3, CalendarDays, ChevronDown, TrendingDown, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { AttendanceTrendPoint, CourseAttendance } from '../../types/dashboard'
import { formatNumber } from '../../utils/format'

// ---------------------------------------------------------------------------
// Attendance per Course (Admin Dashboard)
//
// Vertical bar chart of average attendance rate per course. Everything is
// computed from the existing data — nothing is hardcoded:
//
//  • Period selector (Today / This week / This month / This semester). The
//    course snapshot (data/dashboardData.ts `courseAttendance`) represents the
//    current week; each other period scales those rates by the ratio of the
//    selected period's average rate to the week's average rate, both read from
//    the existing 60-day dashboard trend. No new data source is introduced.
//  • Summary metrics (Average / Highest / Lowest) are calculated from the
//    displayed courses.
//  • Trend comparison uses `previousRate` only when the data source provides
//    it — otherwise it reports "No previous-period comparison".
// ---------------------------------------------------------------------------

type Period = 'today' | 'week' | 'month' | 'semester'
type SortMode = 'highest' | 'lowest' | 'name'

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'semester', label: 'This semester' },
]

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'highest', label: 'Highest attendance' },
  { value: 'lowest', label: 'Lowest attendance' },
  { value: 'name', label: 'Course name' },
]

/** Course datum enriched with the period-adjusted rate shown on the chart. */
interface CourseDatum extends CourseAttendance {
  rate: number
}

function clampRate(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)))
}

/** Attendance rate for a trend day: (Present + Excused) / Total × 100, zero-safe. */
function trendRate(point: AttendanceTrendPoint): number {
  const late = point.late ?? 0
  const excused = point.excused ?? 0
  const total = point.present + late + point.absent + excused
  return total > 0 ? ((point.present + excused) / total) * 100 : 0
}

function mean(values: number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
}

/**
 * Period multipliers derived from the existing dashboard trend data.
 * The course snapshot represents the current week (factor 1); Today, This
 * month and This semester scale it by (period average rate ÷ week average
 * rate). Falls back to 1 (snapshot as-is) when the trend has no usable points.
 */
function periodFactors(trend: AttendanceTrendPoint[]): Record<Period, number> {
  const rates = trend.map(trendRate).filter((rate) => rate > 0)
  const week = rates.slice(-7)
  const weekAvg = mean(week)
  if (!week.length || weekAvg <= 0) return { today: 1, week: 1, month: 1, semester: 1 }
  const latestMonth = [...trend].reverse().find((point) => point.isoDate)?.isoDate?.slice(0, 7)
  const monthRates = latestMonth
    ? trend.filter((point) => point.isoDate?.startsWith(latestMonth)).map(trendRate).filter((rate) => rate > 0)
    : []
  const monthAvg = mean(monthRates)
  const semesterAvg = mean(rates)
  return {
    today: rates[rates.length - 1] / weekAvg,
    week: 1,
    month: monthAvg > 0 ? monthAvg / weekAvg : 1,
    semester: semesterAvg > 0 ? semesterAvg / weekAvg : 1,
  }
}

/** 90+ Excellent · 80–89 Good · 70–79 Needs attention · <70 Low. */
function performanceLevel(avg: number): { label: string; className: string } {
  if (avg >= 90) return { label: 'Excellent', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' }
  if (avg >= 80) return { label: 'Good', className: 'bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300' }
  if (avg >= 70) return { label: 'Needs attention', className: 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300' }
  return { label: 'Low', className: 'bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300' }
}

// ---------------------------------------------------------------------------
// Dropdown (period / sort selector).
// ---------------------------------------------------------------------------

function Dropdown<T extends string>({
  value,
  onChange,
  options,
  label,
  icon: Icon,
}: {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
  label: string
  icon: LucideIcon
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = options.find((option) => option.value === value)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Icon size={14} className="text-blue-600 dark:text-blue-400" />
        {selected?.label}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-20 mt-1.5 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        >
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {option.label}
                  {isSelected && <span className="size-1.5 rounded-full bg-blue-600" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tooltip — Course, Attendance Rate and (when the data supports it) a status
// breakdown, plus Total Records.
// ---------------------------------------------------------------------------

function CourseTooltip({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload?: CourseDatum }> }) {
  if (!active || !payload?.length) return null
  const datum = payload[0]?.payload
  if (!datum) return null

  const hasBreakdown = datum.present != null && datum.late != null && datum.absent != null
  const totalRecords = datum.total ?? (hasBreakdown ? datum.present! + datum.late! + datum.absent! : datum.students)

  return (
    <div className="min-w-44 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white/95 px-3.5 py-3 text-xs shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-800/95">
      <p className="font-bold text-slate-800 dark:text-slate-100">{datum.course}</p>
      <div className="mt-2 flex items-center justify-between gap-6 border-b border-slate-100 pb-2 dark:border-slate-700">
        <span className="text-slate-400">Attendance Rate</span>
        <span className="font-bold text-blue-600 dark:text-blue-400">{datum.rate}%</span>
      </div>
      {hasBreakdown && (
        <ul className="mt-2 space-y-1.5">
          {[
            { label: 'Present', value: datum.present, color: '#22c55e' },
            { label: 'Late', value: datum.late, color: '#f59e0b' },
            { label: 'Absent', value: datum.absent, color: '#ef4444' },
          ].map((row) => (
            <li key={row.label} className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <i className="size-2 rounded-full" style={{ backgroundColor: row.color }} />
                {row.label}
              </span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{formatNumber(row.value ?? 0)}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 flex items-center justify-between gap-6 border-t border-slate-100 pt-2 dark:border-slate-700">
        <span className="text-slate-400">Total Records</span>
        <span className="font-bold text-slate-800 dark:text-slate-100">{formatNumber(totalRecords)}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main chart card.
// ---------------------------------------------------------------------------

export function BarChartCard({ data, trend = [], isLoading = false }: { data: CourseAttendance[]; trend?: AttendanceTrendPoint[]; isLoading?: boolean }) {
  const [period, setPeriod] = useState<Period>('week')
  const [sort, setSort] = useState<SortMode>('highest')

  const displayed = useMemo<CourseDatum[]>(() => {
    const factors = periodFactors(trend)
    const adjusted = data.map((course) => ({ ...course, rate: clampRate(course.rate * factors[period]) }))
    switch (sort) {
      case 'lowest':
        return [...adjusted].sort((a, b) => a.rate - b.rate)
      case 'name':
        return [...adjusted].sort((a, b) => a.course.localeCompare(b.course))
      default:
        return [...adjusted].sort((a, b) => b.rate - a.rate)
    }
  }, [data, trend, period, sort])

  const summary = useMemo(() => {
    const rates = displayed.map((course) => course.rate)
    return {
      avg: Math.round(mean(rates) * 10) / 10,
      highest: rates.length ? Math.max(...rates) : 0,
      lowest: rates.length ? Math.min(...rates) : 0,
    }
  }, [displayed])

  const comparison = useMemo(() => {
    const previous = displayed.flatMap((course) => (course.previousRate == null ? [] : [course.previousRate]))
    if (!displayed.length || previous.length !== displayed.length) return null
    const currentAvg = mean(displayed.map((course) => course.rate))
    const previousAvg = mean(previous)
    return Math.round((currentAvg - previousAvg) * 10) / 10
  }, [displayed])

  const level = performanceLevel(summary.avg)

  if (isLoading) {
    return (
      <section
        className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"
        aria-busy="true"
        aria-label="Loading attendance per course"
      >
        <div className="flex animate-pulse items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="h-4 w-40 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-3 w-56 rounded bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="h-8 w-36 rounded-lg bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="mt-4 grid animate-pulse grid-cols-2 gap-4 sm:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="h-11 rounded-lg bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
        <div className="mt-4 h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800 sm:h-72" />
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Attendance per course</h2>
          <p className="mt-1 text-xs text-slate-400">Average attendance rate for the selected period</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Dropdown value={period} onChange={setPeriod} options={PERIOD_OPTIONS} label="Select period" icon={CalendarDays} />
          <Dropdown value={sort} onChange={setSort} options={SORT_OPTIONS} label="Sort courses" icon={ArrowUpDown} />
        </div>
      </div>

      {!displayed.length ? (
        <div className="mt-5 grid min-h-64 place-items-center rounded-xl border border-dashed border-slate-200 px-5 text-center dark:border-slate-700">
          <div>
            <BarChart3 className="mx-auto mb-3 text-slate-300" size={28} />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No course attendance data available</p>
            <p className="mt-1 text-xs text-slate-400">Course attendance will appear once records are available.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary metrics — computed from the displayed courses. */}
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Average</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">{summary.avg.toFixed(1)}%</p>
              <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${level.className}`}>
                <span className="size-1 rounded-full bg-current" />
                {level.label}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Highest</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{summary.highest}%</p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Lowest</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-rose-600 dark:text-rose-400">{summary.lowest}%</p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Trend</p>
              {comparison === null ? (
                <p className="mt-1 text-xs font-medium text-slate-400">No previous-period comparison</p>
              ) : (
                <>
                  <p
                    className={`mt-1 flex items-center gap-1 text-xl font-bold tracking-tight ${
                      comparison > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : comparison < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {comparison > 0 ? <TrendingUp size={18} /> : comparison < 0 ? <TrendingDown size={18} /> : null}
                    {Math.abs(comparison).toFixed(1)}%
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">vs previous period</p>
                </>
              )}
            </div>
          </div>

          {/* Chart */}
          <div className="mt-4 h-64 sm:h-72" aria-label="Attendance per course bar chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayed} margin={{ top: 30, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="course" interval={0} tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                  tickLine={false}
                  axisLine={false}
                  width={34}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(value: number) => `${value}%`}
                />
                <Tooltip content={<CourseTooltip />} cursor={{ fill: 'rgba(37, 99, 235, 0.07)' }} />
                <Bar dataKey="rate" fill="#2563eb" radius={[7, 7, 0, 0]} maxBarSize={56}>
                  <LabelList
                    dataKey="rate"
                    position="top"
                    offset={8}
                    className="fill-slate-700 dark:fill-slate-200"
                    fontSize={11}
                    fontWeight={700}
                    formatter={(value) => `${value}%`}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  )
}
