import { Link, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../auth/context'

export function Layout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <header className="topbar">
        <Link to="/books" className="brand">MyBookNotes</Link>
        <button type="button" className="button ghost" onClick={handleLogout}>Sair</button>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  )
}
