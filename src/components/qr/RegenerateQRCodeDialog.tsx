import { ConfirmationModal } from '../dialogs/ConfirmationModal'
import type { StudentQRCode } from '../../types/qrCode'

interface RegenerateQRCodeDialogProps {
  student: StudentQRCode | null
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function RegenerateQRCodeDialog({ student, loading, onConfirm, onCancel }: RegenerateQRCodeDialogProps) {
  const name = student?.name ?? 'this student'
  return (
    <ConfirmationModal
      open={Boolean(student)}
      title="Regenerate QR code?"
      description={
        <>
          Are you sure you want to regenerate <strong>{name}</strong>&apos;s QR Code? The existing QR Code will be replaced with a new unique code and can no longer be used.
        </>
      }
      confirmLabel="Regenerate"
      tone="primary"
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
