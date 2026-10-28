import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { ThemeToggle } from '../../theme/ThemeToggle'
import { Brand } from './Brand'

// Moldura das telas públicas (login e cadastro)
export function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1 }}>
        <Brand to="/login" />
        <ThemeToggle />
      </Box>
      <Box component="main" sx={{ flex: 1, display: 'grid', placeItems: 'center', px: 2, pb: 6 }}>
        <Card sx={{ width: '100%', maxWidth: 420 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h1" sx={{ mb: 3 }}>{title}</Typography>
            {children}
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}
