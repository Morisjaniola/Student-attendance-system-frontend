import { Building2, ImagePlus, MapPin, Phone, X } from 'lucide-react'
import { useRef } from 'react'
import type { ChangeEvent } from 'react'
import type { SchoolInformation } from '../../types/settings'
import { SettingsCard } from './SettingsCard'

import { fieldClass } from '../../utils/formStyles'

const inputClass = `${fieldClass} mt-1.5`

interface SchoolInformationCardProps {
  value: SchoolInformation
  saving: boolean
  onChange: (value: SchoolInformation) => void
  onSave: () => void
}

export function SchoolInformationCard({ value, saving, onChange, onSave }: SchoolInformationCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const update = <K extends keyof SchoolInformation>(key: K, next: SchoolInformation[K]) => onChange({ ...value, [key]: next })
  const handleLogo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => update('logoUrl', String(reader.result))
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  return (
    <SettingsCard title="School Information" description="Manage the school identity displayed throughout the attendance system." icon={<Building2 size={19} />} saving={saving} onSave={onSave}>
      <div className="grid gap-4 py-4 lg:grid-cols-[150px_1fr]">
        <div className="flex flex-col items-center justify-start gap-2 rounded-xl bg-slate-50 p-4 dark:bg-slate-950/60">
          {value.logoUrl ? <img src={value.logoUrl} alt="School logo preview" className="size-20 rounded-xl object-cover" /> : <span className="grid size-20 place-items-center rounded-xl bg-blue-600 text-xl font-bold text-white">{value.schoolName.slice(0, 2).toUpperCase() || 'SC'}</span>}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-700"><ImagePlus size={14} />Upload logo</button>
          {value.logoUrl && <button type="button" onClick={() => update('logoUrl', '')} className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-rose-600"><X size={12} />Remove</button>}
          <p className="text-center text-[10px] leading-4 text-slate-400">PNG, JPG, or WebP. Stored locally for this mock.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">School name<input value={value.schoolName} onChange={(event) => update('schoolName', event.target.value)} className={inputClass} /></label>
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">School email<input type="email" value={value.email} onChange={(event) => update('email', event.target.value)} className={inputClass} /></label>
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 sm:col-span-2">School address<input value={value.schoolAddress} onChange={(event) => update('schoolAddress', event.target.value)} className={inputClass} /></label>
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Contact number<input type="tel" value={value.contactNumber} onChange={(event) => update('contactNumber', event.target.value)} className={inputClass} /></label>
          <div className="hidden items-end pb-2 text-[11px] text-slate-400 sm:flex"><span className="inline-flex items-center gap-1.5"><MapPin size={13} />School profile</span><span className="mx-2">·</span><span className="inline-flex items-center gap-1.5"><Phone size={13} />Contact details</span></div>
        </div>
      </div>
    </SettingsCard>
  )
}
