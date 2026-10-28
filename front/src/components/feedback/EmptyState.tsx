import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

export function EmptyState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center', py: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{message}</Typography>
          {action}
        </Stack>
      </CardContent>
    </Card>
  )
}
