import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Plus, X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { fieldClass } from '../../utils/formStyles'

const registerSchema = z.object({
  cardNumber: z.string().trim().min(1, 'RFID card number is required.').max(30, 'RFID card number must be 30 characters or fewer.'),
})

const fieldClassWithMargin = `${fieldClass} mt-1.5`

interface RegisterRFIDModalProps {
  open: boolean
  existingCardNumbers: string[]
  loading: boolean
  onConfirm: (cardNumber: string) => void
  onCancel: () => void
}

export function RegisterRFIDModal({ open, existingCardNumbers, loading, onConfirm, onCancel }: RegisterRFIDModalProps) {
  const form = useForm({ resolver: zodResolver(registerSchema), defaultValues: { cardNumber: '' } })
  useEffect(() => { if (open) form.reset() }, [form, open])
  if (!open) return null

  const submit = (values: { cardNumber: string }) => {
    const number = values.cardNumber.trim()
    if (existingCardNumbers.some((existing) => existing.toLowerCase() === number.toLowerCase())) {
      form.setError('cardNumber', { message: 'This RFID card number is already registered.' })
      return
    }
    onConfirm(number)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 p-0 backdrop-blur-sm sm:p-5">
      <section role="dialog" aria-modal="true" aria-labelledby="register-rfid-title" className="mx-auto min-h-full w-full max-w-md bg-white shadow-2xl dark:bg-slate-900 sm:min-h-0 sm:rounded-2xl">
        <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
          <div>
            <h2 id="register-rfid-title" className="text-lg font-bold text-slate-900 dark:text-white">Register RFID card</h2>
            <p className="mt-1 text-xs text-slate-400">Register a new RFID card into the system.</p>
          </div>
          <button onClick={onCancel} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close register dialog">
            <X size={19} />
          </button>
        </header>
        <form onSubmit={form.handleSubmit(submit)} className="p-5 sm:p-6">
          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
            RFID card number
            <input autoFocus {...form.register('cardNumber')} placeholder="RFID-000021" className={fieldClassWithMargin} />
            {form.formState.errors.cardNumber && <p className="mt-1 text-[10px] font-medium text-rose-600">{form.formState.errors.cardNumber.message}</p>}
          </label>
          <p className="mt-2 text-[10px] leading-5 text-slate-400">The number printed on the physical RFID card. Duplicate card numbers are not allowed. Registered cards are saved as Unassigned until they are assigned to a student.</p>
          <footer className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={onCancel} disabled={loading} className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60">
              {loading ? <LoaderCircle size={14} className="animate-spin" /> : <Plus size={14} />}Register card
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}
