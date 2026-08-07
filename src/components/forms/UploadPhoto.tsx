import { ImagePlus, Trash2, UploadCloud } from 'lucide-react'
import { useRef, useState } from 'react'

interface UploadPhotoProps { value?: string; onChange: (value?: string) => void }

export function UploadPhoto({ value, onChange }: UploadPhotoProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const processFile = (file?: File) => {
    if (!file) return
    if (!['image/png', 'image/jpeg'].includes(file.type)) { setError('Choose a PNG, JPEG, or JPG image.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be 5MB or smaller.'); return }
    const reader = new FileReader()
    reader.onload = () => { onChange(String(reader.result)); setError('') }
    reader.readAsDataURL(file)
  }
  return <div><p className="text-xs font-bold text-slate-700 dark:text-slate-200">Profile photo</p><p className="mt-1 text-[11px] text-slate-400">PNG, JPG, or JPEG · maximum 5MB</p><div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); processFile(event.dataTransfer.files[0]) }} className="mt-3 flex min-h-32 items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-3 transition hover:border-blue-400 hover:bg-blue-50/40 dark:border-slate-700 dark:bg-slate-950/40 dark:hover:bg-blue-500/5">{value ? <img src={value} alt="Student photo preview" className="size-24 rounded-xl object-cover" /> : <div className="grid size-24 place-items-center rounded-xl bg-white text-slate-300 shadow-sm dark:bg-slate-900"><ImagePlus size={26} /></div>}<div className="min-w-0"><p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Drop an image here</p><p className="mt-1 text-[11px] leading-4 text-slate-400">Your image is validated locally before it is attached to this draft.</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-blue-700"><UploadCloud size={14} />Browse file</button>{value && <button type="button" onClick={() => { onChange(undefined); setError('') }} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"><Trash2 size={14} />Remove</button>}</div></div><input ref={inputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={(event) => processFile(event.target.files?.[0])} /></div>{error && <p className="mt-2 text-[11px] font-medium text-rose-600" role="alert">{error}</p>}</div>
}
