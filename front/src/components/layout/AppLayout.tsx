import InsightsOutlined from '@mui/icons-material/InsightsOutlined'
import LibraryBooksOutlined from '@mui/icons-material/LibraryBooksOutlined'
import LogoutOutlined from '@mui/icons-material/LogoutOutlined'
import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import { Link as RouterLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../../auth/context'
import { ThemeToggle } from '../../theme/ThemeToggle'
import { Brand } from './Brand'

// No celular, só o texto: com os ícones, a barra não cabe em 360 px
const NAV_BUTTON = { '& .MuiButton-startIcon': { display: { xs: 'none', sm: 'inherit' } } }

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
        <Toolbar sx={{ gap: { xs: 0, sm: 1 } }}>
          <Brand to="/books" compact />
          <Button color="inherit" startIcon={<LibraryBooksOutlined />} component={RouterLink} to="/books" sx={NAV_BUTTON}>
            Livros
          </Button>
          <Button sx={NAV_BUTTON} color="inherit" startIcon={<InsightsOutlined />} component={RouterLink} to="/metrics">
            Métricas
          </Button>
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
