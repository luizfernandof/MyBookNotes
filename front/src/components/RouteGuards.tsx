import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../auth/context'
import { LoadingState } from './feedback/LoadingState'

export function RequireAuth() {
  const { status } = useAuth()
  if (status === 'loading') return <LoadingState fullScreen />
  if (status === 'anonymous') return <Navigate to="/login" replace />
  return <Outlet />
}

export function RequireGuest() {
  const { status } = useAuth()
  if (status === 'loading') return <LoadingState fullScreen />
  if (status === 'authenticated') return <Navigate to="/books" replace />
  return <Outlet />
}
