import type { AuthResponse } from './types'

// O access token fica só em memória: nada em localStorage, onde um XSS conseguiria lê-lo.
// Ao recarregar a página, a sessão é restaurada pelo cookie HttpOnly do refresh token.
let accessToken: string | null = null
let onSessionExpired: () => void = () => {}

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function setSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler
}

export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string>

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

async function toApiError(response: Response): Promise<ApiError> {
  // Erros da API vêm como ProblemDetail: { detail, errors?: { campo: mensagem } }
  if (response.headers.get('Content-Type')?.includes('json')) {
    const problem = await response.json().catch(() => null)
    if (problem) {
      return new ApiError(response.status, problem.detail ?? 'Erro inesperado', problem.errors ?? {})
    }
  }
  const message = response.status === 401 ? 'Sessão expirada, entre novamente' : 'Erro inesperado'
  return new ApiError(response.status, message)
}

// O refresh token é rotativo e de uso único: duas renovações simultâneas com o mesmo
// cookie seriam vistas pela API como reuso e derrubariam a sessão. Por isso:
// - dentro da aba, chamadas concorrentes compartilham a mesma promise;
// - entre abas, o Web Locks API faz uma esperar a outra terminar.
let refreshInFlight: Promise<boolean> | null = null

export function refreshSession(): Promise<boolean> {
  refreshInFlight ??= withRefreshLock(async () => {
    const response = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
    if (!response.ok) {
      accessToken = null
      return false
    }
    const data: AuthResponse = await response.json()
    accessToken = data.accessToken
    return true
  }).finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}

function withRefreshLock<T>(task: () => Promise<T>): Promise<T> {
  if ('locks' in navigator) {
    return navigator.locks.request('mybooknotes-refresh', task)
  }
  return task()
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

export async function api<T>(path: string, options: RequestOptions = {}, retryOnUnauthorized = true): Promise<T> {
  const headers: Record<string, string> = {}
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`

  const response = await fetch(path, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    credentials: 'include',
  })

  // Access token expirado: renova uma vez e repete a requisição
  if (response.status === 401 && retryOnUnauthorized && !path.startsWith('/api/auth/')) {
    if (await refreshSession()) {
      return api<T>(path, options, false)
    }
    onSessionExpired()
  }

  if (!response.ok) throw await toApiError(response)
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
