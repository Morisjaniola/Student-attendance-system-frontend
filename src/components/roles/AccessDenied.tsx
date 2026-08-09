import { LockKeyhole } from 'lucide-react'

export function AccessDenied() {
  return <div className="grid min-h-screen place-items-center bg-slate-50 p-5 dark:bg-slate-950"><section className="max-w-md rounded-2xl border border-amber-100 bg-white p-7 text-center shadow-sm dark:border-amber-500/20 dark:bg-slate-900"><span className="mx-auto grid size-12 place-items-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"><LockKeyhole size={22} /></span><h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Access Denied</h1><p className="mt-2 text-sm leading-6 text-slate-500">Your current role does not have permission to view this module.</p></section></div>
}
