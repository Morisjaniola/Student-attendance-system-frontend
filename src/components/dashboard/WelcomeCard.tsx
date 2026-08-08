import { useEffect, useState } from 'react'
import { ArrowUpRight, CalendarDays } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

function buildLabel(): { greeting: string; date: string } {
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const date = new Intl.DateTimeFormat('en-PH', { weekday: 'short', month: 'short', day: 'numeric' }).format(now)
  return { greeting, date }
}

export function WelcomeCard() {
  const user = useAuthStore((state) => state.user)
  const [label, setLabel] = useState(buildLabel)

  // Refresh the greeting/date only when they actually change (once per minute check),
  // avoiding an unnecessary re-render every second.
  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = buildLabel()
      setLabel((current) => (current.greeting === next.greeting && current.date === next.date ? current : next))
    }, 60_000)
    return () => window.clearInterval(timer)
  }, [])

  const displayName = user?.name || 'Administrator'

  return (
    <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-700 via-blue-600 to-indigo-600 px-5 py-6 text-white shadow-xl shadow-blue-600/15 sm:px-7 sm:py-7">
      <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 right-24 size-40 rounded-full border-26 border-white/10" />
      <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div><span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-50"><span className="size-1.5 rounded-full bg-emerald-300" />Live attendance monitoring</span><h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">{label.greeting}, {displayName} <span aria-hidden="true">👋</span></h1><p className="mt-1.5 max-w-xl text-sm text-blue-100">Here&apos;s what&apos;s happening across campus today. Attendance is tracking ahead of last Tuesday.</p></div>
        <button className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-lg shadow-blue-950/10 transition hover:-translate-y-0.5 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><CalendarDays size={17} />{label.date}<ArrowUpRight size={16} /></button>
      </div>
    </section>
  )
}
