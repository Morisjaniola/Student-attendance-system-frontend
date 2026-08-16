interface ToggleSwitchProps {
  id: string
  label: string
  description: string
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}

/**
 * Reusable accessible switch used across System Settings.
 *
 * - Real <button role="switch"> with aria-checked
 * - Keyboard focusable with a visible focus ring
 * - ON: blue track, white knob on the right
 * - OFF: muted gray track, knob on the left
 * - Supports disabled state and a smooth knob transition
 */
export function ToggleSwitch({ id, label, description, checked, disabled = false, onChange }: ToggleSwitchProps) {
  return (
    <div className={`flex items-center justify-between gap-4 py-3.5 ${disabled ? 'opacity-55' : ''}`}>
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-xs font-bold text-slate-700 dark:text-slate-200">{label}</span>
        <span className="mt-1 block text-[11px] leading-4 text-slate-400">{description}</span>
      </label>
      <div className="flex shrink-0 items-center gap-2.5">
        <span aria-hidden="true" className={`text-[10px] font-black uppercase tracking-wider transition-colors ${checked ? 'text-blue-600 dark:text-blue-400' : 'text-slate-300 dark:text-slate-600'}`}>
          {checked ? 'On' : 'Off'}
        </span>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/25 disabled:cursor-not-allowed ${checked ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
        >
          <span className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>
    </div>
  )
}

/** @deprecated Use ToggleSwitch instead. */
export const SettingToggle = ToggleSwitch
