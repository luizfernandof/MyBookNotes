import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as authApi from '../api/auth'
import { refreshSession, setSessionExpiredHandler } from '../api/client'
import type { LoginRequest } from '../api/types'
import { AuthContext, type AuthStatus } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    setSessionExpiredHandler(() => setStatus('anonymous'))
    // Restaura a sessão a partir do cookie do refresh token (se houver)
    refreshSession().then((ok) => setStatus(ok ? 'authenticated' : 'anonymous'))
  }, [])

  const login = useCallback(async (data: LoginRequest) => {
    await authApi.login(data)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setStatus('anonymous')
    }
  }, [])

  const value = useMemo(() => ({ status, login, logout }), [status, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
