import { useMemo, useState } from 'react'
import { Megaphone, Search } from 'lucide-react'
import { dashboardData } from '../data/dashboardData'

const priorityColor: Record<string, string> = {
  High: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
  Medium: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  Normal: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
}

export function AnnouncementsPage() {
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'High' | 'Medium' | 'Normal'>('All')

  const announcements = dashboardData.announcements

  const filtered = useMemo(() => {
    return announcements.filter((item) => {
      const matchesSearch =
        search === '' ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
      const matchesPriority = priorityFilter === 'All' || item.priority === priorityFilter
      return matchesSearch && matchesPriority
    })
  }, [announcements, search, priorityFilter])

  return (
    <div className="space-y-6">
      <section>
        <p className="text-[11px] font-bold uppercase tracking-[.15em] text-blue-600">Official notices</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Announcements</h1>
        <p className="mt-1.5 text-sm text-slate-500">View all campus-wide announcements and notices.</p>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search announcements…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-600/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
        </div>
        <div className="flex gap-1.5">
          {(['All', 'High', 'Medium', 'Normal'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setPriorityFilter(level)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                priorityFilter === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Megaphone className="mx-auto mb-3 text-slate-300 dark:text-slate-600" size={32} />
            <p className="text-sm font-medium text-slate-400">No announcements match your search.</p>
          </div>
        )}
        {filtered.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-blue-100 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between gap-3">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${priorityColor[item.priority]}`}>
                {item.priority}
              </span>
              <time className="text-[11px] text-slate-400">{item.date}</time>
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100">{item.title}</h3>
            <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.description}</p>
          </article>
        ))}
      </section>

      <p className="text-center text-[11px] text-slate-400">
        Showing {filtered.length} of {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
