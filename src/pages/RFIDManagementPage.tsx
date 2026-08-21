import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, Contact, Filter, LoaderCircle, Plus, Search, ShieldAlert, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { AssignRFIDModal } from '../components/rfid/AssignRFIDModal'
import { RegisterRFIDModal } from '../components/rfid/RegisterRFIDModal'
import { ReplaceRFIDModal } from '../components/rfid/ReplaceRFIDModal'
import { RFIDCardView } from '../components/rfid/RFIDCardView'
import { RFIDStatusDialog } from '../components/rfid/RFIDStatusDialog'
import { RFIDTable } from '../components/rfid/RFIDTable'
import { Pagination } from '../components/tables/Pagination'
import { rfidService } from '../services/rfidService'
import { studentService } from '../services/studentService'
import { useRFIDStore } from '../stores/rfidStore'
import { useSystemSettings } from '../hooks/useSystemSettings'
import type { RFIDAssignStudent, RFIDCard, RFIDStatus, RFIDStatusChange } from '../types/rfid'
import type { Student } from '../types/student'

function toAssignStudent(student: Student): RFIDAssignStudent {
  return {
    id: student.id,
    studentId: student.studentId,
    name: `${student.firstName} ${student.middleName ? `${student.middleName[0]}. ` : ''}${student.lastName}`,
    avatarColor: student.avatarColor,
    courseCode: student.courseCode,
    course: student.course,
    yearLevel: student.yearLevel,
    section: student.section,
  }
}

export function RFIDManagementPage() {
  const queryClient = useQueryClient()
  const rfidAttendanceEnabled = useSystemSettings((settings) => settings.qrRfid.rfidAttendanceEnabled)
  const { query, statusFilter, setQuery, setStatusFilter, resetFilters } = useRFIDStore()
  const [registerOpen, setRegisterOpen] = useState(false)
  const [assignTarget, setAssignTarget] = useState<RFIDCard | null>(null)
  const [replaceTarget, setReplaceTarget] = useState<RFIDCard | null>(null)
  const [statusTarget, setStatusTarget] = useState<RFIDStatusChange | null>(null)
  const [notice, setNotice] = useState<{ message: string; tone: 'success' | 'error' } | null>(null)
  const [mobilePage, setMobilePage] = useState(0)
  const MOBILE_PAGE_SIZE = 10

  const { data: cards = [], isPending, isError } = useQuery({ queryKey: ['rfid-cards'], queryFn: rfidService.list, staleTime: Infinity })
  const studentsQuery = useQuery({ queryKey: ['students'], queryFn: studentService.list, staleTime: Infinity, enabled: Boolean(assignTarget) })

  const refresh = async () => { await queryClient.invalidateQueries({ queryKey: ['rfid-cards'] }) }

  const registerMutation = useMutation({
    mutationFn: (cardNumber: string) => rfidService.register(cardNumber),
    onSuccess: async () => { await refresh(); setRegisterOpen(false); setNotice({ message: 'RFID card registered successfully.', tone: 'success' }) },
    onError: (error) => setNotice({ message: error instanceof Error ? error.message : 'Unable to register the RFID card. Please try again.', tone: 'error' }),
  })

  const assignMutation = useMutation({
    mutationFn: ({ card, student }: { card: RFIDCard; student: RFIDAssignStudent }) => rfidService.assign(card.id, student),
    onSuccess: async () => { await refresh(); setAssignTarget(null); setNotice({ message: 'RFID card assigned successfully.', tone: 'success' }) },
    onError: (error) => setNotice({ message: error instanceof Error ? error.message : 'Unable to assign the RFID card. Please try again.', tone: 'error' }),
  })

  const replaceMutation = useMutation({
    mutationFn: ({ card, newCardNumber }: { card: RFIDCard; newCardNumber: string }) => rfidService.replace(card.id, newCardNumber),
    onSuccess: async () => { await refresh(); setReplaceTarget(null); setNotice({ message: 'RFID card replaced successfully.', tone: 'success' }) },
    onError: (error) => setNotice({ message: error instanceof Error ? error.message : 'Unable to replace the RFID card. Please try again.', tone: 'error' }),
  })

  const statusMutation = useMutation({
    mutationFn: ({ card, next }: RFIDStatusChange) => rfidService.setStatus(card.id, next),
    onSuccess: async () => { await refresh(); setStatusTarget(null); setNotice({ message: 'RFID card status updated successfully.', tone: 'success' }) },
    onError: (error) => setNotice({ message: error instanceof Error ? error.message : 'Unable to update the RFID card status. Please try again.', tone: 'error' }),
  })

  const assignStudents = useMemo(() => studentsQuery.data?.map(toAssignStudent) ?? [], [studentsQuery.data])
  const activeCardStudentIds = useMemo(() => new Set(cards.filter((card) => card.status === 'Active' && card.studentId).map((card) => card.studentId as string)), [cards])

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase()
    return cards.filter((card) => {
      const matchesSearch = !search || [card.cardNumber, card.studentId ?? '', card.studentName ?? ''].some((value) => value.toLowerCase().includes(search))
      return matchesSearch && (statusFilter === 'All' || card.status === statusFilter)
    })
  }, [query, statusFilter, cards])

  // Reset mobile pagination whenever the visible list changes.
  useEffect(() => { setMobilePage(0) }, [query, statusFilter, cards.length])

  const mobilePageCount = Math.max(1, Math.ceil(filtered.length / MOBILE_PAGE_SIZE))
  const mobileSafePage = Math.min(mobilePage, mobilePageCount - 1)
  const mobileVisible = filtered.slice(mobileSafePage * MOBILE_PAGE_SIZE, mobileSafePage * MOBILE_PAGE_SIZE + MOBILE_PAGE_SIZE)

  const activeCount = cards.filter((card) => card.status === 'Active').length
  const inactiveCount = cards.filter((card) => card.status === 'Inactive').length
  const unassignedCount = cards.filter((card) => card.status === 'Unassigned').length

  const busyCardId =
    assignMutation.isPending ? assignMutation.variables?.card.id
      : replaceMutation.isPending ? replaceMutation.variables?.card.id
        : statusMutation.isPending ? statusMutation.variables?.card.id
          : null

  const requestStatusChange = (card: RFIDCard) => {
    setStatusTarget({ card, next: card.status === 'Inactive' ? 'Active' : 'Inactive' })
  }

  if (isPending) {
    return <div className="grid min-h-[65vh] place-items-center"><p className="flex items-center gap-3 text-sm font-medium text-slate-400"><LoaderCircle size={21} className="animate-spin text-blue-600" />Loading RFID card records…</p></div>
  }

  if (isError) {
    return <div className="grid min-h-[65vh] place-items-center"><div className="max-w-sm rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-500/10 dark:text-rose-300"><AlertCircle className="mx-auto mb-3" />RFID card records could not be loaded. Please refresh and try again.</div></div>
  }

  return (
    <div className="space-y-6">
      {!rfidAttendanceEnabled && (
        <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>RFID attendance is currently disabled in System Settings. Students cannot check in with RFID cards until it is re-enabled.</span>
        </div>
      )}
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.15em] text-blue-600">RFID credential management</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">RFID Management</h1>
          <p className="mt-1.5 text-sm text-slate-500">Register, assign, replace, and manage RFID cards used for student attendance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <span className="size-1.5 rounded-full bg-emerald-500" />{activeCount} active
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            <span className="size-1.5 rounded-full bg-rose-500" />{inactiveCount} inactive
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            <span className="size-1.5 rounded-full bg-amber-500" />{unassignedCount} unassigned
          </span>
        </div>
        <button
          onClick={() => setRegisterOpen(true)}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
        >
          <Plus size={17} />Register RFID card
        </button>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block min-w-0 flex-1 sm:max-w-md">
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search RFID card number, student ID, or student name…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800" aria-label="Clear RFID search">
                <X size={14} />
              </button>
            )}
          </label>
          <div className="flex items-center gap-2">
            <label className="relative">
              <Filter size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as RFIDStatus | 'All')}
                className="h-10 appearance-none rounded-xl border border-slate-200 bg-white py-0 pl-8 pr-8 text-xs font-medium text-slate-600 outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                aria-label="Filter by RFID status"
              >
                <option>All</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Unassigned</option>
              </select>
            </label>
            <button
              onClick={resetFilters}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
            >
              Clear
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          <span className="font-bold text-slate-600 dark:text-slate-300">{filtered.length}</span> RFID card{filtered.length === 1 ? '' : 's'} found
        </p>
      </section>

      <div className="hidden lg:block">
        <RFIDTable
          cards={filtered}
          onAssign={setAssignTarget}
          onReplace={setReplaceTarget}
          onToggleStatus={requestStatusChange}
          busyCardId={busyCardId}
        />
      </div>

      <div className="space-y-3 lg:hidden">
        {mobileVisible.map((card) => (
          <RFIDCardView
            key={card.id}
            card={card}
            onAssign={setAssignTarget}
            onReplace={setReplaceTarget}
            onToggleStatus={requestStatusChange}
            busy={busyCardId === card.id}
          />
        ))}
        {filtered.length === 0 && (
          <div className="grid min-h-56 place-items-center rounded-2xl border border-slate-200/80 bg-white px-5 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <Contact className="mx-auto mb-3 text-slate-300" size={32} />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No RFID cards found.</p>
              <p className="mt-1 text-xs text-slate-400">Adjust your search or filter to see matching RFID card records.</p>
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

      <RegisterRFIDModal
        open={registerOpen}
        existingCardNumbers={cards.map((card) => card.cardNumber)}
        loading={registerMutation.isPending}
        onConfirm={(cardNumber) => registerMutation.mutate(cardNumber)}
        onCancel={() => setRegisterOpen(false)}
      />

      <AssignRFIDModal
        open={Boolean(assignTarget)}
        card={assignTarget}
        students={assignStudents}
        unavailableStudentIds={activeCardStudentIds}
        studentsLoading={studentsQuery.isPending}
        studentsError={studentsQuery.isError}
        loading={assignMutation.isPending}
        onConfirm={(student) => { if (assignTarget) assignMutation.mutate({ card: assignTarget, student }) }}
        onCancel={() => setAssignTarget(null)}
      />

      <ReplaceRFIDModal
        open={Boolean(replaceTarget)}
        card={replaceTarget}
        existingCardNumbers={cards.map((card) => card.cardNumber)}
        loading={replaceMutation.isPending}
        onConfirm={(newCardNumber) => { if (replaceTarget) replaceMutation.mutate({ card: replaceTarget, newCardNumber }) }}
        onCancel={() => setReplaceTarget(null)}
      />

      <RFIDStatusDialog
        target={statusTarget}
        loading={statusMutation.isPending}
        onConfirm={() => { if (statusTarget) statusMutation.mutate(statusTarget) }}
        onCancel={() => setStatusTarget(null)}
      />

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
