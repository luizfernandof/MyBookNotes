import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router'

export function Brand({ to, compact = false }: { to: string; compact?: boolean }) {
  return (
    <Box
      component={RouterLink}
      to={to}
      aria-label="MyBookNotes"
      sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1, color: 'text.primary', textDecoration: 'none' }}
    >
      <MenuBookOutlined color="primary" />
      <Typography variant="h6" component="span" sx={{ fontWeight: 700, display: compact ? { xs: 'none', sm: 'inline' } : 'inline' }}>
        MyBookNotes
      </Typography>
    </Box>
  )
}
