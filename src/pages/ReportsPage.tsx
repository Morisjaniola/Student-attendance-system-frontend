import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { AlertCircle, FileDown, FileSpreadsheet, Printer, Search, X } from 'lucide-react'
import { useMemo } from 'react'
import { ReportEmptyState } from '../components/reports/ReportEmptyState'
import { ReportFilters } from '../components/reports/ReportFilters'
import { ReportLoadingState } from '../components/reports/ReportLoadingState'
import { ReportSummaryCards } from '../components/reports/ReportSummaryCards'
import { ReportsTable } from '../components/reports/ReportsTable'
import { ReportTypeSelector } from '../components/reports/ReportTypeSelector'
import { exportReportExcel, exportReportPDF, reportTypeLabel, reportsService, summarizeReport } from '../services/reportsService'
import { useReportsStore } from '../stores/reportsStore'

export function ReportsPage() {
  const { filters, query, setType, setFilter, setQuery, reset } = useReportsStore()
  const { data, isPending, isError, isFetching } = useQuery({ queryKey: ['reports', filters], queryFn: () => reportsService.fetch(filters), placeholderData: keepPreviousData })

  const visibleRecords = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!data || !search) return data?.records ?? []
    return data.records.filter((record) => [record.student.name, record.student.studentId, record.student.courseCode, record.student.course, record.student.section, record.date, record.dateLabel, record.status].some((value) => value.toLowerCase().includes(search)))
  }, [data, query])
  const summary = useMemo(() => summarizeReport(visibleRecords), [visibleRecords])
  const title = reportTypeLabel(filters.type)

  const exportExcel = async () => { if (visibleRecords.length) await exportReportExcel(visibleRecords, filters, title) }
  const exportPDF = async () => { if (visibleRecords.length && data) await exportReportPDF(visibleRecords, filters, title, data.periodLabel, summary) }

  if (isPending && !data) return <ReportLoadingState />
  if (isError || !data) return <div className="grid min-h-[65vh] place-items-center"><div className="max-w-sm rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-500/10 dark:text-rose-300"><AlertCircle className="mx-auto mb-3" />Attendance reports could not be loaded. Please refresh and try again.</div></div>

  return (
    <>
      <div className="reports-screen space-y-6">
        <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div><p className="text-[11px] font-bold uppercase tracking-[.15em] text-blue-600">Administration</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Attendance Reports</h1><p className="mt-1.5 text-sm text-slate-500">Generate, export, and print attendance reports from existing attendance records.</p></div>
          <div className="flex flex-wrap items-center gap-2"><span className="inline-flex h-9 items-center rounded-full bg-blue-50 px-3 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{visibleRecords.length} result{visibleRecords.length === 1 ? '' : 's'}</span>{isFetching && <span className="text-xs font-medium text-slate-400">Updating…</span>}</div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5"><ReportTypeSelector value={filters.type} onChange={setType} /></section>
        <ReportFilters filters={filters} options={data.options} onChange={setFilter} onReset={reset} />

        {!data.validDateRange && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">The end date must be on or after the start date.</div>}

        <section className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search student, ID, course, section, status…" className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" />{query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={14} /></button>}</div>
          <div className="flex flex-wrap gap-2"><button type="button" disabled={!visibleRecords.length} onClick={exportExcel} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"><FileSpreadsheet size={15} className="text-emerald-600" />Excel</button><button type="button" disabled={!visibleRecords.length} onClick={exportPDF} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"><FileDown size={15} className="text-rose-600" />PDF</button><button type="button" disabled={!visibleRecords.length} onClick={() => window.print()} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><Printer size={15} />Print</button></div>
        </section>

        <ReportSummaryCards summary={summary} />
        {visibleRecords.length ? <ReportsTable records={visibleRecords} type={filters.type} /> : <ReportEmptyState message={data.validDateRange ? undefined : 'Select a valid date range to generate this report.'} />}
      </div>

      <section className="reports-print-area">
        <header><h1>Student Attendance Monitoring System</h1><h2>{title}</h2><p>Period: {data.periodLabel}</p><p>Generated: {new Date().toLocaleString()}</p></header>
        <div className="print-summary"><span>Total Records: {summary.total}</span><span>Present: {summary.present}</span><span>Absent: {summary.absent}</span><span>Late: {summary.late}</span><span>Excused: {summary.excused}</span><span>Attendance Rate: {summary.attendanceRate}%</span></div>
        <table><thead><tr><th>Student</th><th>Student ID</th><th>Course</th><th>Section</th><th>Date</th><th>Time</th><th>Status</th></tr></thead><tbody>{visibleRecords.map((record) => <tr key={record.id}><td>{record.student.name}</td><td>{record.student.studentId}</td><td>{record.student.courseCode}</td><td>{record.student.section}</td><td>{record.dateLabel}</td><td>{record.time}</td><td>{record.status}</td></tr>)}</tbody></table>
        {!visibleRecords.length && <p>No attendance records match this report.</p>}
      </section>
    </>
  )
}
