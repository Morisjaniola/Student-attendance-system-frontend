import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, ClipboardList, LoaderCircle, ShieldAlert, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { AttendanceFilters } from '../components/attendanceRecords/AttendanceFilters'
import { AttendanceRecordCard } from '../components/attendanceRecords/AttendanceRecordCard'
import { AttendanceRecordsTable } from '../components/attendanceRecords/AttendanceRecordsTable'
import { AttendanceSearch } from '../components/attendanceRecords/AttendanceSearch'
import { AttendanceSummaryStats } from '../components/attendanceRecords/AttendanceSummaryStats'
import { EditAttendanceModal } from '../components/attendanceRecords/EditAttendanceModal'
import type { AttendanceEditValues } from '../components/attendanceRecords/EditAttendanceModal'
import { ExportAttendanceMenu } from '../components/attendanceRecords/ExportAttendanceMenu'
import { ConfirmationModal } from '../components/dialogs/ConfirmationModal'
import { Pagination } from '../components/tables/Pagination'
import { attendanceRecordsService, canPerformAttendanceAction, exportAttendanceExcel, exportAttendancePDF, toScannedStudent } from '../services/attendanceRecordsService'
import { studentService } from '../services/studentService'
import { useAttendanceRecordsStore } from '../stores/attendanceRecordsStore'
import { useAuthStore } from '../stores/authStore'
import type { AttendanceRecord } from '../types/attendanceRecord'

const MOBILE_PAGE_SIZE = 10

function todayISO() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function AttendanceRecordsPage() {
  const queryClient = useQueryClient()
  const { query, filters, setQuery, setFilter, resetQuery, clearFilters, resetAll } = useAttendanceRecordsStore()
  const user = useAuthStore((state) => state.user)
  const [editTarget, setEditTarget] = useState<AttendanceRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AttendanceRecord | null>(null)
  const [notice, setNotice] = useState<{ message: string; tone: 'success' | 'error' } | null>(null)
  const [mobilePage, setMobilePage] = useState(0)

  const canEdit = canPerformAttendanceAction(user, 'edit')
  const canDelete = canPerformAttendanceAction(user, 'delete')

  const { data: records = [], isPending, isError } = useQuery({ queryKey: ['attendance-records'], queryFn: attendanceRecordsService.list, staleTime: Infinity })
  const studentsQuery = useQuery({ queryKey: ['students'], queryFn: studentService.list, staleTime: Infinity, enabled: Boolean(editTarget) })
  const students = useMemo(() => studentsQuery.data ?? [], [studentsQuery.data])

  const refresh = async () => { await queryClient.invalidateQueries({ queryKey: ['attendance-records'] }) }

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: AttendanceEditValues }) =>
      attendanceRecordsService.update(id, {
        student: toScannedStudent(values.student),
        date: values.date,
        time: values.time,
        status: values.status,
        method: values.method,
      }),
    onSuccess: async () => { await refresh(); setEditTarget(null); setNotice({ message: 'Attendance record updated successfully.', tone: 'success' }) },
    onError: (error) => setNotice({ message: error instanceof Error ? error.message : 'Unable to update the attendance record. Please try again.', tone: 'error' }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => attendanceRecordsService.remove(id),
    onSuccess: async () => { await refresh(); setDeleteTarget(null); setNotice({ message: 'Attendance record deleted successfully.', tone: 'success' }) },
    onError: (error) => setNotice({ message: error instanceof Error ? error.message : 'Unable to delete the attendance record. Please try again.', tone: 'error' }),
  })

  // Filter option lists derived from the loaded records.
  const dateLabels = useMemo(() => Object.fromEntries(records.map((record) => [record.date, record.dateLabel])), [records])
  const dates = useMemo(() => [...new Set(records.map((record) => record.date))].sort((a, b) => (a < b ? 1 : -1)), [records])
  const sections = useMemo(() => [...new Set(records.map((record) => record.student.section))].sort(), [records])
  const courses = useMemo(() => [...new Set(records.map((record) => record.student.courseCode))].sort(), [records])

  // Search + filters work together (requirements 6.2, 6.3, 10).
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()
    return records.filter((record) => {
      const matchesSearch = !search || [record.student.studentId, record.student.name, record.date, record.dateLabel, record.student.courseCode, record.student.course]
        .some((value) => value.toLowerCase().includes(search))
      const matchesDate = filters.date === 'All' || record.date === filters.date
      const matchesSection = filters.section === 'All' || record.student.section === filters.section
      const matchesStatus = filters.status === 'All' || record.status === filters.status
      const matchesCourse = filters.course === 'All' || record.student.courseCode === filters.course
      return matchesSearch && matchesDate && matchesSection && matchesStatus && matchesCourse
    })
  }, [query, filters, records])

  const filtersActive = query.trim() !== '' || Object.values(filters).some((value) => value !== 'All')

  useEffect(() => { setMobilePage(0) }, [query, filters.date, filters.section, filters.status, filters.course, records.length])

  const mobilePageCount = Math.max(1, Math.ceil(filtered.length / MOBILE_PAGE_SIZE))
  const mobileSafePage = Math.min(mobilePage, mobilePageCount - 1)
  const mobileVisible = filtered.slice(mobileSafePage * MOBILE_PAGE_SIZE, mobileSafePage * MOBILE_PAGE_SIZE + MOBILE_PAGE_SIZE)

  const todayCount = records.filter((record) => record.date === todayISO()).length
  const lateCount = records.filter((record) => record.status === 'Late').length

  const busyRecordId = updateMutation.isPending ? updateMutation.variables?.id : deleteMutation.isPending ? deleteMutation.variables : null

  const handleExportExcel = async () => {
    if (filtered.length === 0) return
    await exportAttendanceExcel(filtered)
    setNotice({ message: `Exported ${filtered.length} attendance record${filtered.length === 1 ? '' : 's'} to Excel.`, tone: 'success' })
  }

  const handleExportPDF = async () => {
    if (filtered.length === 0) return
    await exportAttendancePDF(filtered)
    setNotice({ message: `Exported ${filtered.length} attendance record${filtered.length === 1 ? '' : 's'} to PDF.`, tone: 'success' })
  }

  if (isPending) {
    return <div className="grid min-h-[65vh] place-items-center"><p className="flex items-center gap-3 text-sm font-medium text-slate-400"><LoaderCircle size={21} className="animate-spin text-blue-600" />Loading attendance records…</p></div>
  }

  if (isError) {
    return <div className="grid min-h-[65vh] place-items-center"><div className="max-w-sm rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-500/10 dark:text-rose-300"><AlertCircle className="mx-auto mb-3" />Attendance records could not be loaded. Please refresh and try again.</div></div>
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.15em] text-blue-600">Attendance history</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Attendance Records</h1>
          <p className="mt-1.5 text-sm text-slate-500">View and manage student attendance history.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
            <span className="size-1.5 rounded-full bg-blue-500" />{records.length} records
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-500" />{todayCount} today
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            <span className="size-1.5 rounded-full bg-amber-500" />{lateCount} late
          </span>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <AttendanceSearch value={query} onChange={setQuery} onClear={resetQuery} />
          <div className="flex items-center gap-2">
            {filtersActive && (
              <button
                onClick={resetAll}
                className="inline-flex h-10 items-center rounded-xl px-3 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
              >
                Clear all
              </button>
            )}
            <ExportAttendanceMenu disabled={filtered.length === 0} onExportExcel={handleExportExcel} onExportPDF={handleExportPDF} />
          </div>
        </div>

        <AttendanceFilters
          filters={filters}
          dates={dates}
          dateLabels={dateLabels}
          sections={sections}
          courses={courses}
          onChange={setFilter}
          onClear={clearFilters}
        />

        <p className="text-xs text-slate-400">
          <span className="font-bold text-slate-600 dark:text-slate-300">{filtered.length}</span> attendance record{filtered.length === 1 ? '' : 's'} found
        </p>
      </section>

      {filtered.length > 0 && <AttendanceSummaryStats records={filtered} />}

      <div className="hidden lg:block">
        <AttendanceRecordsTable
          records={filtered}
          canEdit={canEdit}
          canDelete={canDelete}
          busyRecordId={busyRecordId}
          onEdit={setEditTarget}
          onDelete={setDeleteTarget}
        />
      </div>

      <div className="space-y-3 lg:hidden">
        {mobileVisible.map((record) => (
          <AttendanceRecordCard
            key={record.id}
            record={record}
            canEdit={canEdit}
            canDelete={canDelete}
            busy={busyRecordId === record.id}
            onEdit={setEditTarget}
            onDelete={setDeleteTarget}
          />
        ))}
        {filtered.length === 0 && (
          <div className="grid min-h-56 place-items-center rounded-2xl border border-slate-200/80 bg-white px-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <ClipboardList className="mx-auto mb-3 text-slate-300" size={32} />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No attendance records found.</p>
              <p className="mt-1 text-xs text-slate-400">Adjust your search or filters to see matching attendance history.</p>
            </div>
          </div>
        )}
        {filtered.length > MOBILE_PAGE_SIZE && (
          <Pagination
            pageIndex={mobileSafePage}
            pageCount={mobilePageCount}
            pageSize={MOBILE_PAGE_SIZE}
            rowCount={filtered.length}
            onPrevious={() => setMobilePage((value) => Math.max(0, value - 1))}
            onNext={() => setMobilePage((value) => Math.min(mobilePageCount - 1, value + 1))}
            onPageSizeChange={() => setMobilePage(0)}
          />
        )}
      </div>

      <EditAttendanceModal
        open={Boolean(editTarget)}
        record={editTarget}
        students={students}
        studentsLoading={studentsQuery.isPending}
        studentsError={studentsQuery.isError}
        loading={updateMutation.isPending}
        onSave={(recordId, values) => updateMutation.mutate({ id: recordId, values })}
        onCancel={() => setEditTarget(null)}
      />

      <ConfirmationModal
        open={Boolean(deleteTarget)}
        title="Delete attendance record"
        description={
          deleteTarget ? (
            <>
              Are you sure you want to delete this attendance record? <span className="font-semibold text-slate-700 dark:text-slate-200">{deleteTarget.student.name}</span>&rsquo;s attendance for {deleteTarget.dateLabel} at {deleteTarget.time} will be permanently removed.
            </>
          ) : null
        }
        confirmLabel="Delete"
        tone="danger"
        loading={deleteMutation.isPending}
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id) }}
        onCancel={() => setDeleteTarget(null)}
      />

      {notice && (
        <div className={`fixed bottom-5 right-5 z-[80] flex max-w-sm items-center gap-3 rounded-xl px-4 py-3 text-sm text-white shadow-2xl ${notice.tone === 'success' ? 'bg-slate-900 dark:bg-white dark:text-slate-900' : 'bg-rose-600'}`} role="status">
          {notice.tone === 'success' ? <CheckCircle2 size={18} className="shrink-0 text-emerald-400" /> : <ShieldAlert size={18} className="shrink-0 text-white" />}
          <span className="flex-1">{notice.message}</span>
          <button onClick={() => setNotice(null)} aria-label="Dismiss notification" className="rounded p-1 hover:bg-white/10 dark:hover:bg-slate-100">
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
