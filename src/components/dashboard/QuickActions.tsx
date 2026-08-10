import { ContactRound, FileBarChart, QrCode, Radio, ScrollText, UserPlus } from 'lucide-react'

const actions = [
  { label: 'Register student', icon: UserPlus, color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-300' },
  { label: 'Scan QR', icon: QrCode, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-300' },
  { label: 'Scan RFID', icon: Radio, color: 'text-violet-600 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-300' },
  { label: 'Attendance records', icon: ScrollText, color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300' },
  { label: 'Generate report', icon: FileBarChart, color: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-300' },
  { label: 'Student management', icon: ContactRound, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10 dark:text-cyan-300' },
]

// Faculty gets an attendance-focused set of quick actions only (no admin tasks).
const FACULTY_ACTION_LABELS = ['Scan QR', 'Scan RFID', 'Attendance records']

export function QuickActions({ onAction, faculty = false }: { onAction: (name: string) => void; faculty?: boolean }) {
  const visibleActions = faculty ? actions.filter(({ label }) => FACULTY_ACTION_LABELS.includes(label)) : actions
  return <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div><h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Quick actions</h2><p className="mt-1 text-xs text-slate-400">Common attendance tasks</p></div><div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">{visibleActions.map(({ label, icon: Icon, color }) => <button key={label} onClick={() => onAction(label)} className="group flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 p-2 text-center transition hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md hover:shadow-slate-200/60 focus-visible:outline-2 focus-visible:outline-blue-500 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800"><span className={`grid size-9 place-items-center rounded-xl transition group-hover:scale-110 ${color}`}><Icon size={18} /></span><span className="text-[10px] font-semibold leading-tight text-slate-600 dark:text-slate-300">{label}</span></button>)}</div></section>
}
