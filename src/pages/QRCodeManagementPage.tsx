import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, Filter, LoaderCircle, QrCode, Search, ShieldAlert, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Pagination } from '../components/tables/Pagination'
import { QRCodeCard } from '../components/qr/QRCodeCard'
import { QRCodePrint } from '../components/qr/QRCodePrint'
import { QRCodeTable } from '../components/qr/QRCodeTable'
import { QRCodeViewer } from '../components/qr/QRCodeViewer'
import { RegenerateQRCodeDialog } from '../components/qr/RegenerateQRCodeDialog'
import { qrCodeService } from '../services/qrCodeService'
import { useQRCodeStore } from '../stores/qrCodeStore'
import type { QRCodeStatus, StudentQRCode } from '../types/qrCode'

export function QRCodeManagementPage() {
  const queryClient = useQueryClient()
  const { query, statusFilter, setQuery, setStatusFilter, resetFilters } = useQRCodeStore()
  const [viewer, setViewer] = useState<StudentQRCode | null>(null)
  const [regenerateTarget, setRegenerateTarget] = useState<StudentQRCode | null>(null)
  const [printStudent, setPrintStudent] = useState<StudentQRCode | null>(null)
  const [notice, setNotice] = useState<{ message: string; tone: 'success' | 'error' } | null>(null)
  const [mobilePage, setMobilePage] = useState(0)
  const MOBILE_PAGE_SIZE = 10

  const { data: students = [], isPending, isError } = useQuery({ queryKey: ['qr-codes'], queryFn: qrCodeService.list, staleTime: Infinity })

  const refresh = async () => { await queryClient.invalidateQueries({ queryKey: ['qr-codes'] }) }

  const generateMutation = useMutation({
    mutationFn: (student: StudentQRCode) => qrCodeService.generate(student.id),
    onSuccess: async (updated) => { await refresh(); setViewer((current) => current?.id === updated.id ? updated : current); setNotice({ message: 'QR Code generated successfully.', tone: 'success' }) },
    onError: () => setNotice({ message: 'Unable to generate the QR code. Please try again.', tone: 'error' }),
  })

  const regenerateMutation = useMutation({
    mutationFn: (student: StudentQRCode) => qrCodeService.regenerate(student.id),
    onSuccess: async (updated) => {
      await refresh()
      setRegenerateTarget(null)
      setViewer((current) => current?.id === updated.id ? updated : current)
      setNotice({ message: 'QR Code regenerated successfully.', tone: 'success' })
    },
    onError: () => setNotice({ message: 'Unable to regenerate the QR code. Please try again.', tone: 'error' }),
  })

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()
    return students.filter((student) => {
      const searchable = [student.studentId, student.name, student.course, student.courseCode, student.yearLevel, student.section].join(' ').toLowerCase()
      return (!search || searchable.includes(search)) && (statusFilter === 'All' || student.status === statusFilter)
    })
  }, [query, statusFilter, students])

  // Reset mobile pagination whenever the visible list changes.
  useEffect(() => { setMobilePage(0) }, [query, statusFilter, students.length])

  const mobilePageCount = Math.max(1, Math.ceil(filtered.length / MOBILE_PAGE_SIZE))
  const mobileSafePage = Math.min(mobilePage, mobilePageCount - 1)
  const mobileVisible = filtered.slice(mobileSafePage * MOBILE_PAGE_SIZE, mobileSafePage * MOBILE_PAGE_SIZE + MOBILE_PAGE_SIZE)

  const generatedCount = students.filter((student) => student.status === 'Generated').length
  const notGeneratedCount = students.length - generatedCount

  if (isPending) {
    return <div className="grid min-h-[65vh] place-items-center"><p className="flex items-center gap-3 text-sm font-medium text-slate-400"><LoaderCircle size={21} className="animate-spin text-blue-600" />Loading QR code records…</p></div>
  }

  if (isError) {
    return <div className="grid min-h-[65vh] place-items-center"><div className="max-w-sm rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-500/10 dark:text-rose-300"><AlertCircle className="mx-auto mb-3" />QR code records could not be loaded. Please refresh and try again.</div></div>
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.15em] text-blue-600">QR credential management</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">QR Code Management</h1>
          <p className="mt-1.5 text-sm text-slate-500">Generate, view, print, download, and regenerate unique QR codes for student attendance scanning.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-500" />{generatedCount} generated
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <span className="size-1.5 rounded-full bg-slate-400" />{notGeneratedCount} pending
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block min-w-0 flex-1 sm:max-w-md">
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search student ID, name, course, year, or section…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </label>
          <div className="flex items-center gap-2">
            <label className="relative">
              <Filter size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as QRCodeStatus | 'All')}
                className="h-10 appearance-none rounded-xl border border-slate-200 bg-white py-0 pl-8 pr-8 text-xs font-medium text-slate-600 outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                aria-label="Filter by QR status"
              >
                <option>All</option>
                <option>Generated</option>
                <option>Not Generated</option>
              </select>
            </label>
            <button
              onClick={() => resetFilters()}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
            >
              Clear
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          <span className="font-bold text-slate-600 dark:text-slate-300">{filtered.length}</span> matching student{filtered.length === 1 ? '' : 's'}
        </p>
      </section>

      <div className="hidden lg:block">
        <QRCodeTable
          students={filtered}
          onGenerate={(student) => generateMutation.mutate(student)}
          onView={setViewer}
          onPrint={setPrintStudent}
          onRegenerate={setRegenerateTarget}
          busyId={generateMutation.isPending ? generateMutation.variables?.id : regenerateMutation.isPending ? regenerateMutation.variables?.id : null}
        />
      </div>

      <div className="space-y-3 lg:hidden">
        {mobileVisible.map((student) => (
          <QRCodeCard
            key={student.id}
            student={student}
            onGenerate={(target) => generateMutation.mutate(target)}
            onView={setViewer}
            onPrint={setPrintStudent}
            onRegenerate={setRegenerateTarget}
            busy={generateMutation.isPending && generateMutation.variables?.id === student.id || regenerateMutation.isPending && regenerateMutation.variables?.id === student.id}
          />
        ))}
        {filtered.length === 0 && (
          <div className="grid min-h-56 place-items-center rounded-2xl border border-slate-200/80 bg-white px-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <QrCode className="mx-auto mb-3 text-slate-300" size={32} />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No students found</p>
              <p className="mt-1 text-xs text-slate-400">Adjust your search or filter to see matching QR code records.</p>
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

      <QRCodeViewer
        student={viewer}
        onClose={() => setViewer(null)}
        onPrint={setPrintStudent}
        onGenerate={(student) => generateMutation.mutate(student)}
        generating={generateMutation.isPending}
      />

      <RegenerateQRCodeDialog
        student={regenerateTarget}
        loading={regenerateMutation.isPending}
        onConfirm={() => { if (regenerateTarget) regenerateMutation.mutate(regenerateTarget) }}
        onCancel={() => setRegenerateTarget(null)}
      />

      {printStudent && <QRCodePrint student={printStudent} onReady={() => window.print()} onPrinted={() => setPrintStudent(null)} />}

      {notice && (
        <div className={`fixed bottom-5 right-5 z-80 flex max-w-sm items-center gap-3 rounded-xl px-4 py-3 text-sm text-white shadow-2xl ${notice.tone === 'success' ? 'bg-slate-900 dark:bg-white dark:text-slate-900' : 'bg-rose-600'}`} role="status">
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
