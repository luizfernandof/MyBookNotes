import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../auth/context'

function Loading() {
  return <p className="center muted">Carregando…</p>
}

export function RequireAuth() {
  const { status } = useAuth()
  if (status === 'loading') return <Loading />
  if (status === 'anonymous') return <Navigate to="/login" replace />
  return <Outlet />
}

export function RequireGuest() {
  const { status } = useAuth()
  if (status === 'loading') return <Loading />
  if (status === 'authenticated') return <Navigate to="/books" replace />
  return <Outlet />
}
