import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router'

export function Brand({ to }: { to: string }) {
  return (
    <Box
      component={RouterLink}
      to={to}
      sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1, color: 'text.primary', textDecoration: 'none' }}
    >
      <MenuBookOutlined color="primary" />
      <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
        MyBookNotes
      </Typography>
    </Box>
  )
}
