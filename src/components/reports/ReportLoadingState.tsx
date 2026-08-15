import { LoaderCircle } from 'lucide-react'

export function ReportLoadingState() {
  return <div className="grid min-h-[65vh] place-items-center"><p className="flex items-center gap-3 text-sm font-medium text-slate-400"><LoaderCircle size={21} className="animate-spin text-blue-600" />Loading attendance report…</p></div>
}
