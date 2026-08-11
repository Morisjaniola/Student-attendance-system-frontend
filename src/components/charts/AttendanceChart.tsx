import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Activity, BarChart3, CalendarDays, ChevronDown, TrendingDown, TrendingUp } from 'lucide-react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatNumber } from '../../utils/format'
import type { AttendanceTrendPoint } from '../../types/dashboard'

// ---------------------------------------------------------------------------
// Attendance Trend (Admin Dashboard)
//
// Daily attendance rate across a selectable period, with a summary of the
// period averages, a comparison against the previous equivalent period, and an
// optional status breakdown view. All metrics are computed from the existing
// dashboard trend data (see data/dashboardData.ts) — nothing is hardcoded.
// ---------------------------------------------------------------------------

type TrendPeriod = '7d' | '30d' | 'month' | 'semester'
type TrendView = 'rate' | 'breakdown'

const PERIOD_OPTIONS: { value: TrendPeriod; label: string }[] = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'month', label: 'This Month' },
  { value: 'semester', label: 'This Semester' },
]

const STATUS_SERIES = [
  { key: 'present', label: 'Present', color: '#22c55e' },
  { key: 'late', label: 'Late', color: '#f59e0b' },
  { key: 'absent', label: 'Absent', color: '#ef4444' },
  { key: 'excused', label: 'Excused', color: '#2563eb' },
] as const

const VIEW_OPTIONS: { value: TrendView; label: string; icon: typeof Activity }[] = [
  { value: 'rate', label: 'Attendance Rate', icon: Activity },
  { value: 'breakdown', label: 'Status Breakdown', icon: BarChart3 },
]

/** Trend point enriched with the daily attendance rate and total records. */
interface TrendDatum extends AttendanceTrendPoint {
  rate: number
  total: number
}

const ROUNDING = 10

/** Attendance Rate = (Present + Excused) / Total Records x 100, zero-safe. */
function toDatum(point: AttendanceTrendPoint): TrendDatum {
  const present = point.present
  const late = point.late ?? 0
  const absent = point.absent
  const excused = point.excused ?? 0
  const total = present + late + absent + excused
  const rate = total > 0 ? Math.round(((present + excused) / total) * 100 * ROUNDING) / ROUNDING : 0
  return { ...point, rate, total }
}

/** '2026-08-09' -> 'August 9, 2026' (tooltip). Falls back to the axis label. */
function longDateLabel(iso: string | undefined, fallback: string): string {
  if (!iso) return fallback
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function mean(values: number[]): number {
  if (!values.length) return 0
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * ROUNDING) / ROUNDING
}

/** Slices the period window and the previous equivalent window (null if absent). */
function slicePeriod(points: TrendDatum[], period: TrendPeriod): { current: TrendDatum[]; previous: TrendDatum[] | null } {
  if (period === '7d') {
    const current = points.slice(-7)
    const previous = points.length >= 14 ? points.slice(-14, -7) : []
    return { current, previous: previous.length ? previous : null }
  }
  if (period === '30d') {
    const current = points.slice(-30)
    const previous = points.length >= 60 ? points.slice(-60, -30) : []
    return { current, previous: previous.length ? previous : null }
  }
  if (period === 'month') {
    // "This Month" is anchored to the newest data point so it stays correct for mock data.
    const latestIso = points[points.length - 1]?.isoDate
    if (!latestIso) return { current: points, previous: null }
    const month = latestIso.slice(0, 7) // e.g. '2026-08'
    const [year, monthNumber] = month.split('-').map(Number)
    const previousMonth = monthNumber === 1 ? `${year - 1}-12` : `${year}-${String(monthNumber - 1).padStart(2, '0')}`
    const current = points.filter((point) => point.isoDate?.startsWith(month))
    const previous = points.filter((point) => point.isoDate?.startsWith(previousMonth))
    return { current, previous: previous.length ? previous : null }
  }
  // This Semester — every point in the dataset; no earlier semester to compare against.
  return { current: points, previous: null }
}

function computeSummary(current: TrendDatum[], previous: TrendDatum[] | null) {
  const rates = current.map((point) => point.rate)
  const avg = mean(rates)
  const highest = rates.length ? Math.max(...rates) : 0
  const lowest = rates.length ? Math.min(...rates) : 0
  const previousAvg = previous?.length ? mean(previous.map((point) => point.rate)) : null
  const delta = previousAvg === null ? null : Math.round((avg - previousAvg) * ROUNDING) / ROUNDING
  return { avg, highest, lowest, delta }
}

// ---------------------------------------------------------------------------
// Tooltip — Date, Attendance Rate, Present, Late, Absent, Excused, Total.
// ---------------------------------------------------------------------------

function TrendTooltip({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload?: TrendDatum }> }) {
  if (!active || !payload?.length) return null
  const datum = payload[0]?.payload
  if (!datum) return null

  const rows = STATUS_SERIES.map(({ key, label, color }) => ({ label, color, value: datum[key] ?? 0 }))

  return (
    <div className="min-w-44 rounded-xl border border-slate-200 bg-white/95 px-3.5 py-3 text-xs shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-800/95">
      <p className="font-bold text-slate-800 dark:text-slate-100">{longDateLabel(datum.isoDate, datum.date)}</p>
      <div className="mt-2 flex items-center justify-between gap-6 border-b border-slate-100 pb-2 dark:border-slate-700">
        <span className="text-slate-400">Attendance Rate</span>
        <span className="font-bold text-blue-600 dark:text-blue-400">{datum.rate.toFixed(1)}%</span>
      </div>
      <ul className="mt-2 space-y-1.5">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <i className="size-2 rounded-full" style={{ backgroundColor: row.color }} />
              {row.label}
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{formatNumber(row.value)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-center justify-between gap-6 border-t border-slate-100 pt-2 dark:border-slate-700">
        <span className="text-slate-400">Total Records</span>
        <span className="font-bold text-slate-800 dark:text-slate-100">{formatNumber(datum.total)}</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Period selector dropdown.
// ---------------------------------------------------------------------------

function PeriodSelect({ value, onChange }: { value: TrendPeriod; onChange: (value: TrendPeriod) => void }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = PERIOD_OPTIONS.find((option) => option.value === value)

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
        className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <CalendarDays size={14} className="text-blue-600 dark:text-blue-400" />
        {selected?.label}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul role="listbox" className="absolute right-0 z-20 mt-1.5 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          {PERIOD_OPTIONS.map((option) => {
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
// Main chart card.
// ---------------------------------------------------------------------------

export function AttendanceChart({ data, isLoading = false }: { data: AttendanceTrendPoint[]; isLoading?: boolean }) {
  const gradientId = useId().replace(/:/g, '')
  const [period, setPeriod] = useState<TrendPeriod>('30d')
  const [view, setView] = useState<TrendView>('rate')

  const datums = useMemo(() => data.map(toDatum), [data])
  const { current, previous } = useMemo(() => slicePeriod(datums, period), [datums, period])
  // Zero-record days are excluded from the rate series so they never render as
  // misleading 0% dips; the empty state only triggers when the period has no
  // recorded attendance at all.
  const populated = useMemo(() => current.filter((point) => point.total > 0), [current])
  const summary = useMemo(() => computeSummary(populated, previous), [populated, previous])
  const hasRecords = populated.length > 0
  const periodLabel = PERIOD_OPTIONS.find((option) => option.value === period)?.label ?? ''

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6" aria-busy="true" aria-label="Loading attendance trend">
        <div className="flex animate-pulse items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="h-4 w-36 rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-3 w-52 rounded bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="h-8 w-32 rounded-lg bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="mt-5 grid animate-pulse grid-cols-2 gap-4 sm:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="h-12 rounded-lg bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
        <div className="mt-5 h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800 sm:h-72" />
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Attendance Trend</h2>
          <p className="mt-1 text-xs text-slate-400">Daily attendance performance over time</p>
        </div>
        <PeriodSelect value={period} onChange={setPeriod} />
      </div>

      {!hasRecords ? (
        <div className="mt-5 grid min-h-64 place-items-center rounded-xl border border-dashed border-slate-200 px-5 text-center dark:border-slate-700">
          <div>
            <TrendingUp className="mx-auto mb-3 text-slate-300" size={28} />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No attendance data available</p>
            <p className="mt-1 text-xs text-slate-400">Attendance trends will appear once attendance records are available.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary metrics — computed from the selected period. */}
          <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Average Attendance</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">{summary.avg.toFixed(1)}%</p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Highest</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{summary.highest.toFixed(1)}%</p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Lowest</p>
              <p className="mt-1 text-xl font-bold tracking-tight text-rose-600 dark:text-rose-400">{summary.lowest.toFixed(1)}%</p>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Trend</p>
              {summary.delta === null ? (
                <p className="mt-1 text-xs font-medium text-slate-400">No comparison available</p>
              ) : (
                <>
                  <p
                    className={`mt-1 flex items-center gap-1 text-xl font-bold tracking-tight ${
                      summary.delta > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : summary.delta < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {summary.delta > 0 ? <TrendingUp size={18} /> : summary.delta < 0 ? <TrendingDown size={18} /> : null}
                    {Math.abs(summary.delta).toFixed(1)}%
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">vs previous period</p>
                </>
              )}
            </div>
          </div>

          {/* View toggle */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800" role="tablist" aria-label="Attendance trend view">
              {VIEW_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={view === value}
                  onClick={() => setView(value)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    view === value
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon size={13} className={view === value ? 'text-blue-600 dark:text-blue-400' : ''} />
                  {label}
                </button>
              ))}
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              {populated.length} school days · {periodLabel}
            </span>
          </div>

          {/* Chart */}
          <div className="mt-4 h-64 sm:h-72" aria-label="Attendance trend chart">
            <ResponsiveContainer width="100%" height="100%">
              {view === 'rate' ? (
                <AreaChart data={populated} margin={{ top: 6, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} minTickGap={24} />
                  <YAxis
                    domain={[50, 100]}
                    ticks={[50, 60, 70, 80, 90, 100]}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    tickFormatter={(value: number) => `${value}%`}
                  />
                  <Tooltip content={<TrendTooltip />} cursor={{ stroke: '#cbd5e1', strokeDasharray: '3 3' }} />
                  <Area type="monotone" dataKey="rate" name="Attendance Rate" stroke="#2563eb" strokeWidth={2.5} fill={`url(#${gradientId})`} activeDot={{ r: 4 }} />
                </AreaChart>
              ) : (
                <BarChart data={populated} margin={{ top: 6, right: 4, left: 0, bottom: 0 }} barCategoryGap="28%">
                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} minTickGap={24} />
                  <YAxis tickLine={false} axisLine={false} width={40} allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip content={<TrendTooltip />} cursor={{ fill: '#f1f5f9' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  {STATUS_SERIES.map(({ key, label, color }, index) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      name={label}
                      stackId="attendance"
                      fill={color}
                      radius={index === STATUS_SERIES.length - 1 ? [4, 4, 0, 0] : 0}
                    />
                  ))}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </>
      )}
    </section>
  )
}
