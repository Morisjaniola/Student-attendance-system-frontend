import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Download, FileDown, FileSpreadsheet, FileText, Search, X } from 'lucide-react'
import type { AttendanceRecord } from '../../types/attendance'
import { formatNumber, statusStyles } from '../../utils/format'
import { exportAnalyticsCSV, exportAnalyticsExcel, exportAnalyticsPDF } from '../../utils/analyticsExport'

const PAGE_SIZE = 8

interface AttendanceDrillDownModalProps {
  open: boolean
  title: string
  records: AttendanceRecord[]
  onClose: () => void
}

export function AttendanceDrillDownModal({ open, title, records, onClose }: AttendanceDrillDownModalProps) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [exportOpen, setExportOpen] = useState(false)

  const filtered = useMemo(() => {
    if (!search.trim()) return records
    const q = search.toLowerCase()
    return records.filter(
      (r) =>
        r.student.name.toLowerCase().includes(q) ||
        r.student.studentId.toLowerCase().includes(q) ||
        r.student.courseCode.toLowerCase().includes(q) ||
        r.student.section.toLowerCase().includes(q),
    )
  }, [records, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  // Reset to page 1 when search changes.
  const onSearchChange = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleClose = () => {
    setSearch('')
    setPage(1)
    setExportOpen(false)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-70 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" role="presentation" onClick={handleClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="drilldown-title"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-white/40 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 id="drilldown-title" className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
            <p className="mt-0.5 text-xs text-slate-400">{formatNumber(filtered.length)} record{filtered.length === 1 ? '' : 's'}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Export dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setExportOpen((v) => !v)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                <Download size={14} />
                Export
              </button>
              {exportOpen && (
                <div role="menu" className="absolute right-0 z-30 mt-1.5 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { setExportOpen(false); exportAnalyticsExcel(filtered, title) }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <FileSpreadsheet size={14} className="text-emerald-600" />Excel (.xlsx)
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { setExportOpen(false); exportAnalyticsPDF(filtered, title) }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <FileText size={14} className="text-rose-600" />PDF (.pdf)
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { setExportOpen(false); exportAnalyticsCSV(filtered, title) }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <FileDown size={14} className="text-blue-600" />CSV (.csv)
                  </button>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close drill-down"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="border-b border-slate-100 px-5 py-3 dark:border-slate-800">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, ID, course, or section…"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {paginated.length === 0 ? (
            <div className="grid min-h-40 place-items-center p-5 text-center">
              <p className="text-xs text-slate-400">No records found.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="px-5 py-2.5 font-semibold text-slate-500">Student</th>
                  <th className="px-5 py-2.5 font-semibold text-slate-500">ID</th>
                  <th className="hidden px-5 py-2.5 font-semibold text-slate-500 sm:table-cell">Course</th>
                  <th className="hidden px-5 py-2.5 font-semibold text-slate-500 sm:table-cell">Section</th>
                  <th className="px-5 py-2.5 font-semibold text-slate-500">Date</th>
                  <th className="hidden px-5 py-2.5 font-semibold text-slate-500 md:table-cell">Time</th>
                  <th className="px-5 py-2.5 font-semibold text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((record) => (
                  <tr key={record.id} className="border-b border-slate-50 transition hover:bg-slate-50/50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {record.student.initials}
                        </span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{record.student.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 font-mono text-slate-500">{record.student.studentId}</td>
                    <td className="hidden px-5 py-2.5 text-slate-500 sm:table-cell">{record.student.courseCode}</td>
                    <td className="hidden px-5 py-2.5 text-slate-500 sm:table-cell">{record.student.section}</td>
                    <td className="px-5 py-2.5 text-slate-500">{record.dateLabel}</td>
                    <td className="hidden px-5 py-2.5 text-slate-500 md:table-cell">{record.time}</td>
                    <td className="px-5 py-2.5">
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${statusStyles[record.status]}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 dark:border-slate-800">
            <p className="text-[11px] text-slate-400">
              Page {safePage} of {totalPages} · {filtered.length} records
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="inline-flex size-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 dark:hover:bg-slate-800"
                aria-label="Previous page"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (safePage <= 3) {
                  pageNum = i + 1
                } else if (safePage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = safePage - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setPage(pageNum)}
                    className={`inline-flex size-7 items-center justify-center rounded-lg text-xs font-semibold transition ${pageNum === safePage ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex size-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 dark:hover:bg-slate-800"
                aria-label="Next page"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
