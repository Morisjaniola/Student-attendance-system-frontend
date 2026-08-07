import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import type { StatMetric } from '../../types/dashboard'

const palettes = {
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300',
  green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300',
  orange: 'bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300',
  red: 'bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-400/10 dark:text-violet-300',
}

export function StatCard({ metric, index }: { metric: StatMetric; index: number }) {
  const Icon = metric.icon
  const isPositive = metric.trend === 'up'
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.045 }}
      whileHover={{ y: -4 }}
      className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-lg hover:shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-none sm:p-5"
    >
      <span className={`absolute left-0 top-5 h-8 w-1 rounded-r-full ${metric.color === 'blue' ? 'bg-blue-500' : metric.color === 'green' ? 'bg-emerald-500' : metric.color === 'orange' ? 'bg-amber-500' : metric.color === 'red' ? 'bg-rose-500' : 'bg-violet-500'}`} />
      <div className="flex items-start justify-between gap-3 pl-1">
        <div><p className="text-xs font-semibold text-slate-500">{metric.title}</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-[28px]">{metric.value}</p></div>
        <span className={`grid size-10 place-items-center rounded-xl ${palettes[metric.color]}`}><Icon size={20} strokeWidth={2.15} /></span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 pl-1"><span className="truncate text-[11px] text-slate-400">{metric.description}</span><span className={`inline-flex shrink-0 items-center text-[11px] font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{metric.change}</span></div>
    </motion.article>
  )
}
