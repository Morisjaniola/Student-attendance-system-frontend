import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AlertCircle, BarChart3, LoaderCircle } from 'lucide-react'
import { AnalyticsFilters } from '../components/analytics/AnalyticsFilters'
import { AttendanceComparisonChart } from '../components/analytics/AttendanceComparisonChart'
import { AttendancePercentageCard } from '../components/analytics/AttendancePercentageCard'
import { AttendanceStatistics } from '../components/analytics/AttendanceStatistics'
import { AttendanceTrendChart } from '../components/analytics/AttendanceTrendChart'
import { LateAttendanceCard } from '../components/analytics/LateAttendanceCard'
import { analyticsService, shortDateLabel } from '../services/analyticsService'
import { useAnalyticsStore } from '../stores/analyticsStore'

export function AnalyticsPage() {
  const { filters, datePreset, setFilter, setDatePreset, reset } = useAnalyticsStore()

  // Analytics consumes the existing attendance records (Monitoring -> Records ->
  // Analytics). The filters are part of the query key so every filter change
  // recomputes statistics, trends, and percentages.
  const { data, isPending, isError, isFetching } = useQuery({
    queryKey: ['analytics', filters],
    queryFn: () => analyticsService.fetch(filters),
    placeholderData: keepPreviousData,
  })

  if (isPending && !data) {
    return <div className="grid min-h-[65vh] place-items-center"><p className="flex items-center gap-3 text-sm font-medium text-slate-400"><LoaderCircle size={21} className="animate-spin text-blue-600" />Loading attendance analytics…</p></div>
  }

  if (isError || !data) {
    return <div className="grid min-h-[65vh] place-items-center"><div className="max-w-sm rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-500/10 dark:text-rose-300"><AlertCircle className="mx-auto mb-3" />Attendance analytics could not be loaded. Please refresh and try again.</div></div>
  }

  const { statistics, trend, comparisonDetail, health, late, percentage, days, courses, sections, records } = data
  const rangeChip = filters.dateFrom && filters.dateTo ? `${shortDateLabel(filters.dateFrom)} – ${shortDateLabel(filters.dateTo)}` : null
  const hasRecords = statistics.total > 0

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.15em] text-blue-600">Analytics</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Attendance Analytics</h1>
          <p className="mt-1.5 text-sm text-slate-500">Analyze student attendance statistics, trends, and attendance percentages.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
            <span className="size-1.5 rounded-full bg-blue-500" />{statistics.total} records
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-500" />{statistics.present} present
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            <span className="size-1.5 rounded-full bg-amber-500" />{statistics.late} late
          </span>
          {rangeChip && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">{rangeChip}</span>
          )}
          {isFetching && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <LoaderCircle size={13} className="animate-spin" />Updating…
            </span>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <AnalyticsFilters filters={filters} courses={courses} sections={sections} onChange={setFilter} onClear={reset} />
      </section>

      <AttendanceStatistics statistics={statistics} days={days} />

      {hasRecords ? (
        <>
          <section className="grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-8"><AttendanceTrendChart data={trend} /></div>
            <div className="lg:col-span-4"><AttendancePercentageCard percentage={percentage} /></div>
          </section>
          <section className="grid gap-5 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <AttendanceComparisonChart
                comparisonDetail={comparisonDetail}
                health={health}
                records={records}
                courses={courses}
                sections={sections}
                datePreset={datePreset}
                filters={filters}
                onDatePresetChange={setDatePreset}
                onFilterChange={setFilter}
              />
            </div>
            <div className="lg:col-span-7"><LateAttendanceCard analysis={late} /></div>
          </section>
        </>
      ) : (
        <>
          <AttendancePercentageCard percentage={percentage} />
          <div className="grid min-h-56 place-items-center rounded-2xl border border-slate-200/80 bg-white px-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <BarChart3 className="mx-auto mb-3 text-slate-300" size={32} />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No attendance data for the selected filters.</p>
              <p className="mt-1 text-xs text-slate-400">Adjust the date range, course, or section to see analytics.</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
