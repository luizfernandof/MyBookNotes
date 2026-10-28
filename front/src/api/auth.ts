import { api, setAccessToken } from './client'
import type { AuthResponse, LoginRequest, RegisterRequest, User } from './types'

export function register(data: RegisterRequest) {
  return api<User>('/api/auth/register', { method: 'POST', body: data })
}

export async function login(data: LoginRequest) {
  const response = await api<AuthResponse>('/api/auth/login', { method: 'POST', body: data })
  setAccessToken(response.accessToken)
}

export async function logout() {
  try {
    await api<void>('/api/auth/logout', { method: 'POST' })
  } finally {
    setAccessToken(null)
  }
}
