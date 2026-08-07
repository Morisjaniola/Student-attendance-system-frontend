import { motion } from 'framer-motion'
import { UserCheck, UserRound, UserRoundX, UsersRound, VenusAndMars } from 'lucide-react'
import type { Student } from '../../types/student'

const cardData = (students: Student[]) => [
  { label: 'Total students', value: students.length, note: 'Registered profiles', icon: UsersRound, tint: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-300' },
  { label: 'Active students', value: students.filter((student) => student.status === 'Active').length, note: 'Eligible for attendance', icon: UserCheck, tint: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-300' },
  { label: 'Inactive students', value: students.filter((student) => student.status === 'Inactive').length, note: 'Temporarily inactive', icon: UserRoundX, tint: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300' },
  { label: 'Male students', value: students.filter((student) => student.gender === 'Male').length, note: 'Registered male students', icon: UserRound, tint: 'text-violet-600 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-300' },
  { label: 'Female students', value: students.filter((student) => student.gender === 'Female').length, note: 'Registered female students', icon: VenusAndMars, tint: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-300' },
]

export function StatisticsCards({ students }: { students: Student[] }) {
  return <section className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-5">{cardData(students).map(({ label, value, note, icon: Icon, tint }, index) => <motion.article key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .04 }} whileHover={{ y: -3 }} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-lg hover:shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-none"><div className="flex items-start justify-between"><p className="text-xs font-semibold text-slate-500">{label}</p><span className={`grid size-9 place-items-center rounded-xl ${tint}`}><Icon size={18} /></span></div><p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{value.toLocaleString('en-PH')}</p><p className="mt-1 text-[11px] text-slate-400">{note}</p></motion.article>)}</section>
}
