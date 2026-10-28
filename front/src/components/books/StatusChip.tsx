import Chip, { type ChipProps } from '@mui/material/Chip'
import { READING_STATUS_LABELS, type ReadingStatus } from '../../api/types'

const STATUS_COLORS: Record<ReadingStatus, ChipProps['color']> = {
  WANT_TO_READ: 'default',
  READING: 'warning',
  READ: 'success',
  DROPPED: 'error',
}

export function StatusChip({ status }: { status: ReadingStatus }) {
  return (
    <Chip
      label={READING_STATUS_LABELS[status]}
      color={STATUS_COLORS[status]}
      size="small"
      variant="outlined"
      sx={{ alignSelf: 'flex-start', fontWeight: 500 }}
    />
  )
}
