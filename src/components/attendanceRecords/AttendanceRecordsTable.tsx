import { ClipboardList, LoaderCircle, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { AttendanceRecord } from '../../types/attendanceRecord'
import { initials } from '../../utils/format'
import { Pagination } from '../tables/Pagination'
import { AttendanceMethodBadge, AttendanceStatusBadge } from './AttendanceBadges'

const PAGE_SIZE = 10

interface AttendanceRecordsTableProps {
  records: AttendanceRecord[]
  canEdit: boolean
  canDelete: boolean
  busyRecordId?: string | null
  onEdit: (record: AttendanceRecord) => void
  onDelete: (record: AttendanceRecord) => void
}

export function AttendanceRecordsTable({ records, canEdit, canDelete, busyRecordId, onEdit, onDelete }: AttendanceRecordsTableProps) {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const pageCount = Math.max(1, Math.ceil(records.length / pageSize))
  const safePage = Math.min(pageIndex, pageCount - 1)
  const visible = records.slice(safePage * pageSize, safePage * pageSize + pageSize)
  const showActions = canEdit || canDelete

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-295 text-left">
          <thead className="bg-slate-50/95 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:bg-slate-950/95">
            <tr>
              <th className="px-5 py-3">Student ID</th>
              <th className="px-3 py-3">Student name</th>
              <th className="px-3 py-3">Course</th>
              <th className="px-3 py-3">Year</th>
              <th className="px-3 py-3">Section</th>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">Time</th>
              <th className="px-3 py-3">Method</th>
              <th className="px-3 py-3">Status</th>
              {showActions && <th className="px-5 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {visible.map((record) => {
              const busy = busyRecordId === record.id
              return (
                <tr key={record.id} className="text-xs text-slate-600 transition hover:bg-slate-50/80 dark:text-slate-300 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">{record.student.studentId}</td>
                  <td className="px-3 py-3.5">
                    <span className="flex items-center gap-2.5">
                      <span className={`grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl text-[10px] font-bold ${record.student.avatarColor}`}>
                        {record.student.photo ? <img src={record.student.photo} alt="" className="size-full object-cover" /> : initials(record.student.name)}
                      </span>
                      <span className="max-w-44 truncate font-semibold text-slate-700 dark:text-slate-200">{record.student.name}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{record.student.courseCode}</p>
                    <p className="mt-0.5 max-w-36 truncate text-[10px] text-slate-400">{record.student.course?.replace('BS ', '')}</p>
                  </td>
                  <td className="px-3 py-3.5">{record.student.yearLevel}</td>
                  <td className="px-3 py-3.5">{record.student.section}</td>
                  <td className="px-3 py-3.5 text-[11px] text-slate-400">{record.dateLabel}</td>
                  <td className="px-3 py-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">{record.time}</td>
                  <td className="px-3 py-3.5"><AttendanceMethodBadge method={record.method} /></td>
                  <td className="px-3 py-3.5"><AttendanceStatusBadge status={record.status} /></td>
                  {showActions && (
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {canEdit && (
                          <button
                            onClick={() => onEdit(record)}
                            disabled={busy}
                            className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50 dark:hover:bg-blue-500/10"
                            aria-label={`Edit attendance record for ${record.student.name}`}
                            title="Edit record"
                          >
                            {busy ? <LoaderCircle size={15} className="animate-spin" /> : <Pencil size={15} />}
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => onDelete(record)}
                            disabled={busy}
                            className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:hover:bg-rose-500/10"
                            aria-label={`Delete attendance record for ${record.student.name}`}
                            title="Delete record"
                          >
                            {busy ? <LoaderCircle size={15} className="animate-spin" /> : <Trash2 size={15} />}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              )
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={showActions ? 10 : 9} className="px-6 py-14 text-center">
                  <ClipboardList className="mx-auto mb-2 text-slate-300" size={28} />
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No attendance records found.</p>
                  <p className="mt-1 text-xs text-slate-400">Adjust your search or filters to see matching records.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {records.length > 0 && (
        <Pagination
          pageIndex={safePage}
          pageCount={pageCount}
          pageSize={pageSize}
          rowCount={records.length}
          onPrevious={() => setPageIndex((value) => Math.max(0, value - 1))}
          onNext={() => setPageIndex((value) => Math.min(pageCount - 1, value + 1))}
          onPageSizeChange={(value) => { setPageSize(value); setPageIndex(0) }}
        />
      )}
    </section>
  )
}
