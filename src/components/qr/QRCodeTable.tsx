import { Eye, LoaderCircle, Plus, Printer, QrCode, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import type { StudentQRCode } from '../../types/qrCode'
import { Pagination } from '../tables/Pagination'
import { QRCodeDownloadButton } from './QRCodeDownload'
import { QRCodeGenerator } from './QRCodeGenerator'

const PAGE_SIZE = 10

const statusStyles = {
  Generated: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300',
  'Not Generated': 'bg-slate-100 text-slate-500 ring-slate-500/15 dark:bg-slate-700/50 dark:text-slate-300',
}

interface QRCodeTableProps {
  students: StudentQRCode[]
  onGenerate: (student: StudentQRCode) => void
  onView: (student: StudentQRCode) => void
  onPrint: (student: StudentQRCode) => void
  onRegenerate: (student: StudentQRCode) => void
  busyId?: string | null
}

export function QRCodeTable({ students, onGenerate, onView, onPrint, onRegenerate, busyId }: QRCodeTableProps) {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const pageCount = Math.max(1, Math.ceil(students.length / pageSize))
  const safePage = Math.min(pageIndex, pageCount - 1)
  const visible = students.slice(safePage * pageSize, safePage * pageSize + pageSize)

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-295 text-left">
          <thead className="bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:bg-slate-950/50">
            <tr>
              <th className="px-5 py-3">Student</th>
              <th className="px-3 py-3">Student ID</th>
              <th className="px-3 py-3">Course</th>
              <th className="px-3 py-3">Year / Section</th>
              <th className="px-3 py-3">QR status</th>
              <th className="px-3 py-3">QR code</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {visible.map((student) => {
              const generated = student.status === 'Generated' && Boolean(student.qrValue)
              const busy = busyId === student.id
              return (
                <tr key={student.id} className="text-xs text-slate-600 transition hover:bg-slate-50/80 dark:text-slate-300 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className={`grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl text-[10px] font-bold ${student.avatarColor}`}>
                        {student.photo ? <img src={student.photo} alt="" className="size-full object-cover" /> : student.initials}
                      </span>
                      <button onClick={() => onView(student)} className="max-w-44 truncate text-left font-semibold text-slate-700 hover:text-blue-600 dark:text-slate-200">
                        {student.name}
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 font-mono text-[11px] text-slate-400">{student.studentId}</td>
                  <td className="px-3 py-3.5">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{student.courseCode}</p>
                    <p className="mt-0.5 max-w-36 truncate text-[10px] text-slate-400">{student.course.replace('BS ', '')}</p>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="block">{student.yearLevel}</span>
                    <span className="text-[10px] text-slate-400">{student.section}</span>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ring-inset ${statusStyles[student.status]}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    {generated ? (
                      <span className="inline-block overflow-hidden rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700">
                        <QRCodeGenerator value={student.qrValue!} size={42} ariaLabel={`QR code preview for ${student.name}`} />
                      </span>
                    ) : (
                      <span className="grid size-9 place-items-center rounded-lg bg-slate-50 text-slate-300 dark:bg-slate-800">
                        <QrCode size={18} aria-hidden="true" />
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      {generated ? (
                        <>
                          <button onClick={() => onView(student)} className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10" aria-label={`View ${student.name}'s QR code`} title="View QR code">
                            <Eye size={15} />
                          </button>
                          <button onClick={() => onPrint(student)} className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800" aria-label={`Print ${student.name}'s QR code`} title="Print QR code">
                            <Printer size={15} />
                          </button>
                          <QRCodeDownloadButton student={student} variant="icon" />
                          <button onClick={() => onRegenerate(student)} disabled={busy} className="grid size-8 place-items-center rounded-lg text-slate-400 transition hover:bg-amber-50 hover:text-amber-600 disabled:opacity-50 dark:hover:bg-amber-500/10" aria-label={`Regenerate ${student.name}'s QR code`} title="Regenerate QR code">
                            {busy ? <LoaderCircle size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => onGenerate(student)}
                          disabled={busy}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[11px] font-bold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
                        >
                          {busy ? <LoaderCircle size={14} className="animate-spin" /> : <Plus size={14} />}Generate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">No students match your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {students.length > 0 && (
        <Pagination
          pageIndex={safePage}
          pageCount={pageCount}
          pageSize={pageSize}
          rowCount={students.length}
          onPrevious={() => setPageIndex((value) => Math.max(0, value - 1))}
          onNext={() => setPageIndex((value) => Math.min(pageCount - 1, value + 1))}
          onPageSizeChange={(value) => { setPageSize(value); setPageIndex(0) }}
        />
      )}
    </section>
  )
}
