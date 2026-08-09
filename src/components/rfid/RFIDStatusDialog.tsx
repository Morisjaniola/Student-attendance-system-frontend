import type { RFIDStatusChange } from '../../types/rfid'
import { ConfirmationModal } from '../dialogs/ConfirmationModal'

interface RFIDStatusDialogProps {
  target: RFIDStatusChange | null
  loading: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function RFIDStatusDialog({ target, loading, onConfirm, onCancel }: RFIDStatusDialogProps) {
  const activating = target?.next === 'Active'

  return (
    <ConfirmationModal
      open={Boolean(target)}
      title={activating ? 'Activate RFID card?' : 'Deactivate RFID card?'}
      description={
        target ? (
          activating ? (
            <>Are you sure you want to activate RFID card <strong>{target.card.cardNumber}</strong>? The card will be re-enabled for use.</>
          ) : (
            <>Are you sure you want to deactivate RFID card <strong>{target.card.cardNumber}</strong>? Inactive cards cannot be used for attendance.</>
          )
        ) : null
      }
      confirmLabel={activating ? 'Activate card' : 'Deactivate card'}
      tone={activating ? 'primary' : 'danger'}
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
