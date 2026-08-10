import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftRight, LoaderCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { RFIDCard } from '../../types/rfid'
import { fieldClass } from '../../utils/formStyles'
import { ConfirmationModal } from '../dialogs/ConfirmationModal'
import { RFIDStatusBadge } from './RFIDStatusBadge'

const replaceSchema = z.object({
  newCardNumber: z.string().trim().min(1, 'Enter the new RFID card number.').max(30, 'RFID card number must be 30 characters or fewer.'),
})

const fieldClassWithMargin = `${fieldClass} mt-1.5`

interface ReplaceRFIDModalProps {
  open: boolean
  card: RFIDCard | null
  existingCardNumbers: string[]
  loading: boolean
  onConfirm: (newCardNumber: string) => void
  onCancel: () => void
}

export function ReplaceRFIDModal({ open, card, existingCardNumbers, loading, onConfirm, onCancel }: ReplaceRFIDModalProps) {
  const [confirming, setConfirming] = useState(false)
  const [pendingNumber, setPendingNumber] = useState('')
  const form = useForm({ resolver: zodResolver(replaceSchema), defaultValues: { newCardNumber: '' } })

  useEffect(() => { if (open) { form.reset(); setConfirming(false); setPendingNumber('') } }, [form, open, card?.id])

  if (!open || !card) return null

  const submit = (values: { newCardNumber: string }) => {
    const number = values.newCardNumber.trim()
    if (existingCardNumbers.some((existing) => existing.toLowerCase() === number.toLowerCase())) {
      form.setError('newCardNumber', { message: 'This RFID card number is already registered.' })
      return
    }
    setPendingNumber(number)
    setConfirming(true)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 p-0 backdrop-blur-sm sm:p-5">
        <section role="dialog" aria-modal="true" aria-labelledby="replace-rfid-title" className="mx-auto min-h-full w-full max-w-md bg-white shadow-2xl dark:bg-slate-900 sm:min-h-0 sm:rounded-2xl">
          <header className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
            <div>
              <h2 id="replace-rfid-title" className="text-lg font-bold text-slate-900 dark:text-white">Replace RFID card</h2>
              <p className="mt-1 text-xs text-slate-400">Replace a lost or damaged card for the same student.</p>
            </div>
            <button onClick={onCancel} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close replace dialog">
              <X size={19} />
            </button>
          </header>

          <div className="p-5 sm:p-6">
            <div className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-950/60">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current RFID card</p>
                  <p className="mt-0.5 truncate font-mono text-sm font-bold text-slate-800 dark:text-slate-100">{card.cardNumber}</p>
                </div>
                <RFIDStatusBadge status={card.status} />
              </div>
              {card.studentName && (
                <p className="mt-2 border-t border-slate-200 pt-2 text-[10px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Assigned to <span className="font-bold text-slate-700 dark:text-slate-200">{card.studentName}</span> ({card.studentId})
                </p>
              )}
            </div>

            <form onSubmit={form.handleSubmit(submit)} className="mt-4">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                New RFID card number
                <input autoFocus {...form.register('newCardNumber')} placeholder="RFID-000022" className={fieldClassWithMargin} />
                {form.formState.errors.newCardNumber && <p className="mt-1 text-[10px] font-medium text-rose-600">{form.formState.errors.newCardNumber.message}</p>}
              </label>
              <p className="mt-2 text-[10px] leading-5 text-slate-400">The current card will be disabled and the new card will be linked to the same student. Duplicate card numbers are not allowed.</p>
              <footer className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={onCancel} disabled={loading} className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60">
                  {loading ? <LoaderCircle size={14} className="animate-spin" /> : <ArrowLeftRight size={14} />}Continue
                </button>
              </footer>
            </form>
          </div>
        </section>
      </div>

      <ConfirmationModal
        open={confirming}
        title="Replace RFID card?"
        description={
          <>
            Are you sure you want to replace this RFID card? <strong>{card.cardNumber}</strong> will be disabled and <strong>{pendingNumber}</strong> will be assigned to {card.studentName ?? 'the student'}.
          </>
        }
        confirmLabel="Replace card"
        tone="primary"
        loading={loading}
        onConfirm={() => onConfirm(pendingNumber)}
        onCancel={() => setConfirming(false)}
      />
    </>
  )
}
