import LogoutOutlined from '@mui/icons-material/LogoutOutlined'
import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import { Outlet, useNavigate } from 'react-router'
import { useAuth } from '../../auth/context'
import { ThemeToggle } from '../../theme/ThemeToggle'
import { Brand } from './Brand'

export function AppLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 1 }}>
          <Brand to="/books" />
          <ThemeToggle />
          <Button color="inherit" startIcon={<LogoutOutlined />} onClick={handleLogout}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>
      <Container component="main" maxWidth="lg" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </>
  )
}
