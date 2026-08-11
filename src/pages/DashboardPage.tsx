import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, LoaderCircle, X } from 'lucide-react'
import { getDashboardData } from '../data/dashboardData'
import { WelcomeCard } from '../components/dashboard/WelcomeCard'
import { StatCard } from '../components/cards/StatCard'
import { StudentOverviewCard } from '../components/cards/StudentOverviewCard'
import { ClockWidget } from '../components/dashboard/ClockWidget'
import { AttendanceChart } from '../components/charts/AttendanceChart'
import { PieChartCard } from '../components/charts/PieChartCard'
import { BarChartCard } from '../components/charts/BarChartCard'
import { QRCard, RFIDCard } from '../components/cards/ScanCards'
import { QuickActions } from '../components/dashboard/QuickActions'
import { ActivityTable } from '../components/tables/ActivityTable'
import { UpcomingEvents } from '../components/dashboard/UpcomingEvents'
import { NotificationPanel } from '../components/dashboard/NotificationPanel'
import { AnnouncementPanel } from '../components/dashboard/AnnouncementPanel'
import type { AttendanceActivity, SchoolEvent } from '../types/dashboard'

export function DashboardPage() {
  const navigate = useNavigate()
  const { data, isPending, isError } = useQuery({ queryKey: ['dashboard'], queryFn: getDashboardData, staleTime: Infinity })
  const [notice, setNotice] = useState<string | null>(null)
  if (isPending) return <div className="grid min-h-[65vh] place-items-center"><div className="flex items-center gap-3 text-sm font-medium text-slate-400"><LoaderCircle className="animate-spin text-blue-600" size={21} />Loading attendance dashboard…</div></div>
  if (isError || !data) return <div className="grid min-h-[65vh] place-items-center"><div className="max-w-sm rounded-2xl border border-rose-100 bg-rose-50 p-6 text-center text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-500/10 dark:text-rose-300"><AlertCircle className="mx-auto mb-3" />We couldn&apos;t load the attendance dashboard. Please refresh and try again.</div></div>
  const viewStudent = (student: AttendanceActivity) => setNotice(`${student.name}'s attendance profile is ready to view.`)
  const viewEvent = (event: SchoolEvent) => setNotice(`${event.title}: ${event.date}, ${event.time}.`)
  const actionRoutes: Record<string, string> = { 'Register student': '/students', 'Scan QR': '/scanning', 'Scan RFID': '/scanning', 'Attendance records': '/attendance-records', 'Generate report': '/reports', 'Student management': '/students' }
  return <div className="space-y-6"><WelcomeCard /><section className="grid grid-cols-1 gap-4 min-[500px]:grid-cols-2 xl:grid-cols-5">{data.attendanceStats.map((metric, index) => <StatCard key={metric.id} metric={metric} index={index} />)}</section><section className="grid gap-5 xl:grid-cols-12"><div className="xl:col-span-8"><AttendanceChart data={data.trend} /></div><div className="grid gap-5 sm:grid-cols-2 xl:col-span-4 xl:grid-cols-1"><PieChartCard data={data.distribution} /><ClockWidget /></div></section><section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-12"><div className="xl:col-span-4"><StudentOverviewCard {...data.studentStats} /></div><div className="xl:col-span-4"><QRCard scan={data.qr} /></div><div className="xl:col-span-4"><RFIDCard scan={data.rfid} lastScan={data.rfid.lastScan} /></div></section><section className="grid gap-5 xl:grid-cols-12"><div className="xl:col-span-7"><BarChartCard data={data.courseAttendance} /></div><div className="xl:col-span-5"><QuickActions onAction={(action) => navigate(actionRoutes[action] ?? '/dashboard')} /></div></section><ActivityTable data={data.activities} onView={viewStudent} /><UpcomingEvents events={data.events} onEvent={viewEvent} /><section className="grid gap-5 lg:grid-cols-2"><AnnouncementPanel announcements={data.announcements} /><NotificationPanel notifications={data.notifications} /></section>{notice && <div className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl dark:bg-white dark:text-slate-900" role="status"><span className="flex-1">{notice}</span><button onClick={() => setNotice(null)} className="rounded p-1 hover:bg-white/15 dark:hover:bg-slate-100" aria-label="Dismiss message"><X size={16} /></button></div>}</div>
}
