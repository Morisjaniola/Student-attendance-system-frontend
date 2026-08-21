import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useNavigate } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import {
  Bell,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  Contact,
  CornerDownLeft,
  LayoutDashboard,
  LoaderCircle,
  PieChart,
  QrCode,
  Radio,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { studentService } from '../../services/studentService'
import { userService } from '../../services/userService'
import { attendanceRecordsService } from '../../services/attendanceRecordsService'
import { qrCodeService } from '../../services/qrCodeService'
import { rfidService } from '../../services/rfidService'
import { useStudentStore } from '../../stores/studentStore'
import { useUserStore } from '../../stores/userStore'
import { useAttendanceRecordsStore } from '../../stores/attendanceRecordsStore'
import { useQRCodeStore } from '../../stores/qrCodeStore'
import { useRFIDStore } from '../../stores/rfidStore'
import type { Student } from '../../types/student'
import type { SystemUser } from '../../types/user'
import type { AttendanceRecord } from '../../types/attendance'
import type { StudentQRCode } from '../../types/qrCode'
import type { RFIDCard } from '../../types/rfid'

interface PageEntry {
  label: string
  to: string
  icon: LucideIcon
}

/** App pages (mirrors the sidebar navigation) — used as navigation targets. */
const pages: PageEntry[] = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Students', to: '/students', icon: UsersRound },
  { label: 'QR Codes', to: '/qr-codes', icon: QrCode },
  { label: 'RFID Management', to: '/rfid', icon: Contact },
  { label: 'Attendance Monitoring', to: '/attendance-monitoring', icon: ClipboardCheck },
  { label: 'Attendance Records', to: '/attendance-records', icon: CalendarDays },
  { label: 'Analytics', to: '/analytics', icon: PieChart },
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'User Management', to: '/users', icon: UsersRound },
  { label: 'Audit Logs', to: '/audit-logs', icon: ClipboardList },
  { label: 'Roles & Permissions', to: '/roles-permissions', icon: ShieldCheck },
  { label: 'System Settings', to: '/settings', icon: Settings },
]

interface SearchResult {
  id: string
  section: string
  label: string
  detail: string
  icon: LucideIcon
  to: string
  /** When set, the destination page's existing search state is set to this value. */
  pageQuery?: string
}

const SECTIONS = ['Pages', 'Students', 'Users', 'Attendance records', 'QR codes', 'RFID cards']

function matches(haystack: string, query: string) {
  return haystack.toLowerCase().includes(query)
}

function studentName(student: Student) {
  return `${student.firstName} ${student.middleName ? `${student.middleName[0]}. ` : ''}${student.lastName}`
}

function buildResults(query: string, students: Student[], users: SystemUser[], records: AttendanceRecord[], qrCodes: StudentQRCode[], cards: RFIDCard[]): SearchResult[] {
  const q = query.trim().toLowerCase()
  const results: SearchResult[] = []

  if (!q) {
    pages.forEach((page) => results.push({ id: `page-${page.to}`, section: 'Pages', label: page.label, detail: page.to, icon: page.icon, to: page.to }))
    return results
  }

  pages
    .filter((page) => matches(page.label, q))
    .slice(0, 5)
    .forEach((page) => results.push({ id: `page-${page.to}`, section: 'Pages', label: page.label, detail: page.to, icon: page.icon, to: page.to }))

  students
    .filter((student) => matches(`${studentName(student)} ${student.studentId} ${student.courseCode} ${student.yearLevel} ${student.section} ${student.email}`, q))
    .slice(0, 4)
    .forEach((student) => results.push({
      id: `student-${student.id}`,
      section: 'Students',
      label: studentName(student),
      detail: `${student.studentId} · ${student.courseCode} ${student.section}`,
      icon: UsersRound,
      to: '/students',
      pageQuery: studentName(student),
    }))

  users
    .filter((user) => matches(`${user.name} ${user.username} ${user.email} ${user.role}`, q))
    .slice(0, 4)
    .forEach((user) => results.push({
      id: `user-${user.id}`,
      section: 'Users',
      label: user.name,
      detail: `${user.role} · ${user.email}`,
      icon: UserRound,
      to: '/users',
      pageQuery: user.name,
    }))

  records
    .filter((record) => matches(`${record.student.name} ${record.student.studentId} ${record.student.courseCode} ${record.student.section} ${record.status} ${record.method} ${record.dateLabel}`, q))
    .slice(0, 4)
    .forEach((record) => results.push({
      id: `attendance-${record.id}`,
      section: 'Attendance records',
      label: record.student.name,
      detail: `${record.dateLabel} · ${record.status} · ${record.method}`,
      icon: CalendarDays,
      to: '/attendance-records',
      pageQuery: record.student.name,
    }))

  qrCodes
    .filter((code) => matches(`${code.name} ${code.studentId} ${code.courseCode} ${code.section}`, q))
    .slice(0, 3)
    .forEach((code) => results.push({
      id: `qr-${code.id}`,
      section: 'QR codes',
      label: code.name,
      detail: `${code.studentId} · ${code.status}`,
      icon: QrCode,
      to: '/qr-codes',
      pageQuery: code.name,
    }))

  cards
    .filter((card) => matches(`${card.cardNumber} ${card.studentName ?? ''} ${card.status}`, q))
    .slice(0, 3)
    .forEach((card) => results.push({
      id: `rfid-${card.id}`,
      section: 'RFID cards',
      label: card.studentName ?? card.cardNumber,
      detail: `${card.cardNumber} · ${card.status}`,
      icon: Radio,
      to: '/rfid',
      pageQuery: card.studentName ?? card.cardNumber,
    }))

  return results
}

/** Reuses the destination page's existing search state so the record is visible on arrival. */
function syncPageQuery(to: string, value: string) {
  switch (to) {
    case '/students':
      useStudentStore.getState().setFilters({ query: value })
      break
    case '/users':
      useUserStore.getState().setQuery(value)
      break
    case '/attendance-records':
      useAttendanceRecordsStore.getState().setQuery(value)
      break
    case '/qr-codes':
      useQRCodeStore.getState().setQuery(value)
      break
    case '/rfid':
      useRFIDStore.getState().setQuery(value)
      break
  }
}

export function GlobalSearch() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const trimmed = query.trim()
  const debouncedTrimmed = useDebouncedValue(trimmed, 300)
  const enabled = open && debouncedTrimmed.length > 0

  const queries = useQueries({
    queries: [
      { queryKey: ['students'], queryFn: studentService.list, staleTime: Infinity, enabled },
      { queryKey: ['users'], queryFn: userService.list, staleTime: Infinity, enabled },
      { queryKey: ['attendance-records'], queryFn: attendanceRecordsService.list, staleTime: Infinity, enabled },
      { queryKey: ['qr-codes'], queryFn: qrCodeService.list, staleTime: Infinity, enabled },
      { queryKey: ['rfid-cards'], queryFn: rfidService.list, staleTime: Infinity, enabled },
    ],
  })
  const students = (queries[0].data as Student[] | undefined) ?? []
  const users = (queries[1].data as SystemUser[] | undefined) ?? []
  const records = (queries[2].data as AttendanceRecord[] | undefined) ?? []
  const qrCodes = (queries[3].data as StudentQRCode[] | undefined) ?? []
  const cards = (queries[4].data as RFIDCard[] | undefined) ?? []
  const isFetching = queries.some((result) => result.isFetching)

  const results = useMemo(
    () => buildResults(debouncedTrimmed, students, users, records, qrCodes, cards),
    [debouncedTrimmed, students, users, records, qrCodes, cards],
  )

  const grouped = useMemo(
    () => SECTIONS.map((section) => ({ section, items: results.filter((result) => result.section === section) })).filter((group) => group.items.length > 0),
    [results],
  )
  const flatResults = useMemo(() => grouped.flatMap((group) => group.items), [grouped])

  useEffect(() => {
    setActiveIndex(0)
  }, [flatResults.length])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(true)
        setActiveIndex(0)
        inputRef.current?.focus()
      } else if (event.key === 'Escape' && open) {
        setOpen(false)
        inputRef.current?.blur()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const select = (result: SearchResult) => {
    setOpen(false)
    setQuery('')
    inputRef.current?.blur()
    if (result.pageQuery !== undefined) syncPageQuery(result.to, result.pageQuery)
    navigate(result.to)
  }

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!open || flatResults.length === 0) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % flatResults.length)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + flatResults.length) % flatResults.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const result = flatResults[activeIndex]
      if (result) select(result)
    }
  }

  let flatIndex = -1

  return (
    <span
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false)
      }}
    >
      <input
        ref={inputRef}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => {
          setOpen(true)
          setActiveIndex(0)
        }}
        onKeyDown={handleInputKeyDown}
        placeholder="Search students, reports..."
        aria-label="Search dashboard"
        role="combobox"
        aria-expanded={open}
        aria-controls="global-search-results"
        aria-autocomplete="list"
        className="w-44 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-200 xl:w-64"
      />
      {open && (
        <div
          id="global-search-results"
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 top-full z-30 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="max-h-96 overflow-y-auto p-1.5">
            {grouped.map((group) => (
              <div key={group.section}>
                <p className="px-2.5 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{group.section}</p>
                {group.items.map((result) => {
                  flatIndex += 1
                  const index = flatIndex
                  const active = index === activeIndex
                  const Icon = result.icon
                  return (
                    <button
                      key={result.id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => select(result)}
                      className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition ${active ? 'bg-blue-50 dark:bg-blue-500/10' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${active ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                        <Icon size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{result.label}</span>
                        <span className="block truncate text-[11px] text-slate-400">{result.detail}</span>
                      </span>
                      {result.section !== 'Pages' && active && <CornerDownLeft size={13} className="shrink-0 text-blue-500" />}
                    </button>
                  )
                })}
              </div>
            ))}
            {isFetching && trimmed.length > 0 && (
              <p className="flex items-center gap-2 px-2.5 py-6 text-xs font-medium text-slate-400">
                <LoaderCircle size={14} className="animate-spin text-blue-500" />Searching…
              </p>
            )}
            {!isFetching && flatResults.length === 0 && debouncedTrimmed.length > 0 && (
              <p className="px-2.5 py-6 text-center text-xs text-slate-400">
                No results for <span className="font-semibold text-slate-600 dark:text-slate-300">&ldquo;{debouncedTrimmed}&rdquo;</span>
              </p>
            )}
          </div>
          {flatResults.length > 0 && (
            <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50/80 px-3 py-2 text-[10px] font-medium text-slate-400 dark:border-slate-800 dark:bg-slate-950/40">
              <span className="flex items-center gap-1"><kbd className="rounded border border-slate-200 bg-white px-1 py-0.5 font-sans dark:border-slate-700 dark:bg-slate-900">↑↓</kbd> navigate</span>
              <span className="flex items-center gap-1"><kbd className="rounded border border-slate-200 bg-white px-1 py-0.5 font-sans dark:border-slate-700 dark:bg-slate-900">↵</kbd> open</span>
              <span className="flex items-center gap-1"><kbd className="rounded border border-slate-200 bg-white px-1 py-0.5 font-sans dark:border-slate-700 dark:bg-slate-900">esc</kbd> close</span>
              <span className="ml-auto font-semibold text-slate-500 dark:text-slate-300">{flatResults.length} result{flatResults.length === 1 ? '' : 's'}</span>
            </div>
          )}
        </div>
      )}
    </span>
  )
}
