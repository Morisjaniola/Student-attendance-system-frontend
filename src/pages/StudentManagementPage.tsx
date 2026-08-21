import { useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Archive, Download, FileUp, LoaderCircle, Plus, Printer, ShieldAlert, UserCheck, UserRoundX, X } from 'lucide-react'
import { StudentFilters } from '../components/students/StudentFilters'
import { SearchBar } from '../components/students/SearchBar'
import { StatisticsCards } from '../components/students/StatisticsCards'
import { StudentProfile } from '../components/students/StudentProfile'
import { StudentForm } from '../components/forms/StudentForm'
import { StudentTable } from '../components/tables/StudentTable'
import { ConfirmationModal } from '../components/dialogs/ConfirmationModal'
import { studentService } from '../services/studentService'
import { useStudentStore } from '../stores/studentStore'
import { useAuthStore } from '../stores/authStore'
import { hasPermission } from '../services/roleService'
import type { Student, StudentFormValues, StudentStatus } from '../types/student'

type PendingAction = { ids: string[]; status: StudentStatus; title: string; description: string; tone: 'danger' | 'primary' }

function exportStudents(students: Student[]) {
  const headers = ['Student ID', 'Full Name', 'Course', 'Year Level', 'Section', 'Gender', 'RFID Number', 'QR Code', 'Status', 'Date Registered']
  const rows = students.map((student) => [student.studentId, `${student.firstName} ${student.middleName} ${student.lastName}`.replace(/\s+/g, ' ').trim(), student.course, student.yearLevel, student.section, student.gender, student.rfidNumber, student.qrCode, student.status, student.registeredAt])
  const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const link = document.createElement('a'); link.href = url; link.download = 'student-directory.csv'; link.click(); URL.revokeObjectURL(url)
}

export function StudentManagementPage() {
  const queryClient = useQueryClient()
  const uploadRef = useRef<HTMLInputElement>(null)
  const { filters, selectedIds, setSelectedIds } = useStudentStore()
  const user = useAuthStore((state) => state.user)
  const isStaff = user?.role === 'Staff'
  const canCreate = !isStaff || hasPermission(user?.role, 'Student Management', 'Create')
  const canUpdate = !isStaff || hasPermission(user?.role, 'Student Management', 'Update')
  const [profile, setProfile] = useState<Student | undefined>()
  const [formStudent, setFormStudent] = useState<Student | undefined>()
  const [formOpen, setFormOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const { data: students = [], isPending, isError } = useQuery({ queryKey: ['students'], queryFn: studentService.list, staleTime: Infinity })
  const refresh = async () => { await Promise.all([ queryClient.invalidateQueries({ queryKey: ['students'] }), queryClient.invalidateQueries({ queryKey: ['dashboard'] }), queryClient.invalidateQueries({ queryKey: ['qr-codes'] }), queryClient.invalidateQueries({ queryKey: ['rfid-cards'] }), ]) }
  const saveMutation = useMutation({ mutationFn: async ({ student, values }: { student?: Student; values: StudentFormValues }) => student ? studentService.update(student.id, values) : studentService.create(values), onSuccess: async (_, variables) => { await refresh(); setNotice(variables.student ? 'Student information updated successfully.' : 'Student registered and activated successfully.') } })
  const statusMutation = useMutation({ mutationFn: ({ ids, status }: { ids: string[]; status: StudentStatus }) => studentService.setStatus(ids, status), onSuccess: async (_, variables) => { await refresh(); setSelectedIds([]); setProfile(undefined); setNotice(`${variables.ids.length} student${variables.ids.length === 1 ? '' : 's'} ${variables.status === 'Archived' ? 'archived' : `set to ${variables.status.toLowerCase()}`} successfully.`) } })
  const filteredStudents = useMemo(() => {
    const query = filters.query.toLowerCase().trim()
    return students.filter((student) => {
      const searchable = [student.studentId, student.firstName, student.middleName, student.lastName, student.course, student.courseCode, student.yearLevel, student.section, student.rfidNumber, student.qrCode].join(' ').toLowerCase()
      return (!query || searchable.includes(query)) && (filters.course === 'All' || student.course === filters.course) && (filters.yearLevel === 'All' || student.yearLevel === filters.yearLevel) && (filters.section === 'All' || student.section === filters.section) && (filters.status === 'All' || student.status === filters.status) && (filters.gender === 'All' || student.gender === filters.gender) && (!filters.registeredFrom || student.registeredAt >= filters.registeredFrom) && (!filters.registeredTo || student.registeredAt <= filters.registeredTo)
    })
  }, [filters, students])
  const requestStatus = (student: Student, status: StudentStatus) => {
    if (!canUpdate) return
    const archive = status === 'Archived'
    setPendingAction({ ids: [student.id], status, title: archive ? `Archive ${student.firstName} ${student.lastName}?` : `Change student status?`, description: archive ? 'This is a soft delete. The student will be removed from active operations but can be restored at any time.' : `Set ${student.firstName} ${student.lastName}'s status to ${status}.`, tone: archive ? 'danger' : 'primary' })
  }
  const requestBulk = (status: StudentStatus) => {
    if (!canUpdate) return
    if (!selectedIds.length) return
    const archive = status === 'Archived'
    setPendingAction({ ids: selectedIds, status, title: archive ? `Archive ${selectedIds.length} students?` : `Update ${selectedIds.length} student records?`, description: archive ? 'This is a soft delete. Archived students remain available for restoration.' : `Set the selected students to ${status}.`, tone: archive ? 'danger' : 'primary' })
  }
  const onSave = async (values: StudentFormValues) => {
    if ((formStudent && !canUpdate) || (!formStudent && !canCreate)) return
    await saveMutation.mutateAsync({ student: formStudent, values })
  }
  const openStudentForm = (student?: Student) => {
    if (student ? !canUpdate : !canCreate) return
    setProfile(undefined)
    setFormStudent(student)
    setFormOpen(true)
  }
  if (isPending) return <div className="grid min-h-[65vh] place-items-center"><p className="flex items-center gap-3 text-sm font-medium text-slate-400"><LoaderCircle size={21} className="animate-spin text-blue-600" />Loading student records…</p></div>
  if (isError) return <div className="grid min-h-[65vh] place-items-center"><div className="rounded-2xl bg-rose-50 p-6 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">Student records could not be loaded. Refresh the page to try again.</div></div>
  return <div className="space-y-6"><section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.15em] text-blue-600">Directory management</p><h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Students</h1><p className="mt-1.5 text-sm text-slate-500">Manage student profiles, credentials, statuses, and attendance details.</p></div><div className="flex flex-wrap items-center gap-2"><input ref={uploadRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={(event) => { if (event.target.files?.[0]) { setNotice(`${event.target.files[0].name} selected for mock import review.`); event.target.value = '' } }} /><button onClick={() => uploadRef.current?.click()} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"><FileUp size={16} />Import</button><button onClick={() => exportStudents(filteredStudents)} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"><Download size={16} />Export</button><button onClick={() => window.print()} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"><Printer size={16} />Print</button><button onClick={() => { setFormStudent(undefined); setFormOpen(true) }} className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"><Plus size={17} />Register student</button></div></section><StatisticsCards students={students} /><section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><SearchBar /><p className="text-xs text-slate-400"><span className="font-bold text-slate-600 dark:text-slate-300">{filteredStudents.length}</span> matching students</p></div><div className="mt-3"><StudentFilters /></div></section>{selectedIds.length > 0 && <section className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/75 p-3.5 shadow-sm dark:border-blue-500/20 dark:bg-blue-500/10 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs font-semibold text-blue-700 dark:text-blue-300"><span className="mr-1 rounded bg-blue-600 px-1.5 py-0.5 text-white">{selectedIds.length}</span>students selected</p><div className="flex flex-wrap items-center gap-2"><button onClick={() => requestBulk('Active')} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[11px] font-bold text-emerald-700 shadow-sm hover:bg-emerald-50 dark:bg-slate-900 dark:text-emerald-300"><UserCheck size={14} />Activate</button><button onClick={() => requestBulk('Inactive')} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-[11px] font-bold text-slate-600 shadow-sm hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300"><UserRoundX size={14} />Deactivate</button><button onClick={() => requestBulk('Archived')} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-[11px] font-bold text-white shadow-sm hover:bg-rose-700"><Archive size={14} />Archive</button><button onClick={() => setSelectedIds([])} className="rounded-lg p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-500/20" aria-label="Clear selected students"><X size={15} /></button></div></section>}<StudentTable students={filteredStudents} onView={setProfile} onEdit={(student) => { setProfile(undefined); setFormStudent(student); setFormOpen(true) }} onStatusChange={requestStatus} /><StudentProfile student={profile} onClose={() => setProfile(undefined)} onEdit={(student) => { setProfile(undefined); setFormStudent(student); setFormOpen(true) }} onStatusChange={requestStatus} /><StudentForm open={formOpen} student={formStudent} onClose={() => setFormOpen(false)} onSave={onSave} /><ConfirmationModal open={!!pendingAction} title={pendingAction?.title ?? ''} description={pendingAction?.description} confirmLabel={pendingAction?.status === 'Archived' ? 'Archive students' : 'Confirm change'} tone={pendingAction?.tone} loading={statusMutation.isPending} onCancel={() => setPendingAction(null)} onConfirm={async () => { if (!pendingAction) return; await statusMutation.mutateAsync(pendingAction); setPendingAction(null) }} />{notice && <div className="fixed bottom-5 right-5 z-80 flex max-w-sm items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl dark:bg-white dark:text-slate-900" role="status"><ShieldAlert size={18} className="shrink-0 text-blue-400" /><span className="flex-1">{notice}</span><button onClick={() => setNotice(null)} aria-label="Dismiss notification" className="rounded p-1 hover:bg-white/10 dark:hover:bg-slate-100"><X size={15} /></button></div>}</div>
}
