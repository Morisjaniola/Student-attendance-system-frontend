interface SettingToggleProps {
  id: string
  label: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}

export function SettingToggle({ id, label, description, checked, disabled = false, onChange }: SettingToggleProps) {
  return (
    <div className={`flex items-start justify-between gap-4 py-3.5 ${disabled ? 'opacity-55' : ''}`}>
      <div className="min-w-0">
        <label htmlFor={id} className="block text-xs font-bold text-slate-700 dark:text-slate-200">{label}</label>
        <p className="mt-1 text-[11px] leading-4 text-slate-400">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition focus:outline-none focus:ring-4 focus:ring-blue-600/20 disabled:cursor-not-allowed ${checked ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
      >
        <span className={`absolute top-0.75 size-4.5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5.75' : 'translate-x-0.75'}`} />
      </button>
    </div>
  )
}
