import { Download } from 'lucide-react'
import QRCode from 'qrcode'
import type { ReactNode } from 'react'
import type { StudentQRCode } from '../../types/qrCode'

/**
 * Renders the student's QR code to an off-screen canvas and downloads it as a
 * PNG image named after the student, e.g. student-2026-01001-qr.png.
 */
export async function downloadStudentQR(student: StudentQRCode): Promise<void> {
  if (!student.qrValue) return

  const canvas = document.createElement('canvas')
  await QRCode.toCanvas(canvas, student.qrValue, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: 'M',
    color: { dark: '#0f172a', light: '#ffffff' },
  })

  const url = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.href = url
  link.download = `student-${student.studentId}-qr.png`
  document.body.appendChild(link)
  link.click()
  link.remove()
}

interface QRCodeDownloadButtonProps {
  student: StudentQRCode
  onDownloaded?: () => void
  variant?: 'icon' | 'full'
  className?: string
  children?: ReactNode
}

export function QRCodeDownloadButton({ student, onDownloaded, variant = 'full', className, children }: QRCodeDownloadButtonProps) {
  if (!student.qrValue) return null
  const base = variant === 'icon'
    ? 'inline-flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10'
    : 'inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800'
  return (
    <button
      type="button"
      onClick={async () => { await downloadStudentQR(student); onDownloaded?.() }}
      className={`${base} ${className ?? ''}`}
      aria-label={`Download ${student.name}'s QR code as PNG`}
    >
      <Download size={variant === 'icon' ? 15 : 16} aria-hidden="true" />
      {variant === 'full' && (children ?? 'Download')}
    </button>
  )
}
