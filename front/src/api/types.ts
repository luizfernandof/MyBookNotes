// Tipos espelhando os DTOs da API (api/src/main/java/br/com/devl/mybooknotes/dto)

export const READING_STATUSES = ['WANT_TO_READ', 'READING', 'READ', 'DROPPED'] as const
export type ReadingStatus = (typeof READING_STATUSES)[number]

export const READING_STATUS_LABELS: Record<ReadingStatus, string> = {
  WANT_TO_READ: 'Quero ler',
  READING: 'Lendo',
  READ: 'Lido',
  DROPPED: 'Abandonado',
}

export interface Book {
  id: string
  title: string
  author: string
  rate: number | null
  summary: string | null
  createdAt: string
  finishedAt: string | null
  coverUrl: string | null
  status: ReadingStatus
}

export interface BookRequest {
  title: string
  author: string
  rate: number | null
  summary: string | null
  finishedAt: string | null
  coverUrl: string | null
  status: ReadingStatus
}

export interface Page<T> {
  content: T[]
  page: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface User {
  id: string
  email: string
}

export interface AuthResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
}
