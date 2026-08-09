import { useQuery } from '@tanstack/react-query'
import { AlertCircle, ClipboardList, LoaderCircle, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { AuditLogDetailsModal } from '../components/auditLogs/AuditLogDetailsModal'
import { AuditLogFilters } from '../components/auditLogs/AuditLogFilters'
import { AuditLogSearch } from '../components/auditLogs/AuditLogSearch'
import { AuditLogsTable } from '../components/auditLogs/AuditLogsTable'
import { Pagination } from '../components/tables/Pagination'
import { auditLogService } from '../services/auditLogService'
import { useAuditLogStore } from '../stores/auditLogStore'
import type { AuditLog } from '../types/auditLog'

export function AuditLogsPage() {
  const { filters, setQuery, setFilter, resetFilters } = useAuditLogStore()
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const { data: logs = [], isPending, isError } = useQuery({ queryKey: ['audit-logs'], queryFn: auditLogService.list, staleTime: Infinity })

  const filteredLogs = useMemo(() => {
    const query = filters.query.trim().toLowerCase()
    return logs.filter((log) => {
      const matchesSearch = !query || [log.userName, log.module, log.action, log.description].some((value) => value.toLowerCase().includes(query))
      const date = log.timestamp.slice(0, 10)
      const matchesFrom = !filters.dateFrom || date >= filters.dateFrom
      const matchesTo = !filters.dateTo || date <= filters.dateTo
      return matchesSearch && (filters.userId === 'All' || log.userId === filters.userId) && matchesFrom && matchesTo && (filters.module === 'All' || log.module === filters.module) && (filters.action === 'All' || log.action === filters.action)
    })
  }, [filters, logs])

  useEffect(() => { setPageIndex(0) }, [filters])
  const pageCount = Math.max(1, Math.ceil(filteredLogs.length / pageSize))
  const safePage = Math.min(pageIndex, pageCount - 1)
  const visibleLogs = filteredLogs.slice(safePage * pageSize, safePage * pageSize + pageSize)
  const successCount = logs.filter((log) => log.status === 'Success').length

  if (isPending) return <div className="grid min-h-[65vh] place-items-center"><p className="flex items-center gap-3 text-sm font-medium text-slate-400"><LoaderCircle size={21} className="animate-spin text-blue-600" />Loading audit logs…</p></div>
  if (isError) return <div className="grid min-h-[65vh] place-items-center"><div className="max-w-sm rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-500/10 dark:text-rose-300"><AlertCircle className="mx-auto mb-3" />Audit logs could not be loaded. Please refresh and try again.</div></div>

  return <div className="space-y-6"><section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.15em] text-blue-600">System activity</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Audit Logs</h1><p className="mt-1.5 text-sm text-slate-500">Review recorded activities performed by administrator, faculty, and staff users.</p></div><div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"><ClipboardList size={13} />{logs.length} activities</span><span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"><ShieldCheck size={13} />{successCount} successful</span></div></section><section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><AuditLogSearch value={filters.query} onChange={setQuery} onClear={() => setQuery('')} /><p className="text-xs text-slate-400"><span className="font-bold text-slate-600 dark:text-slate-300">{filteredLogs.length}</span> activit{filteredLogs.length === 1 ? 'y' : 'ies'} found</p></div><AuditLogFilters filters={filters} logs={logs} onChange={setFilter} onClear={resetFilters} /></section><section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"><AuditLogsTable logs={visibleLogs} onViewDetails={setSelectedLog} />{filteredLogs.length > pageSize && <Pagination pageIndex={safePage} pageCount={pageCount} pageSize={pageSize} rowCount={filteredLogs.length} label="activities" onPrevious={() => setPageIndex((value) => Math.max(0, value - 1))} onNext={() => setPageIndex((value) => Math.min(pageCount - 1, value + 1))} onPageSizeChange={(value) => { setPageSize(value); setPageIndex(0) }} />}</section><AuditLogDetailsModal log={selectedLog} onClose={() => setSelectedLog(null)} /></div>
}
