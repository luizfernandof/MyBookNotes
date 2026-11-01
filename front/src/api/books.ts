import { api } from './client'
import type { Book, BookRequest, Page, ReadingStatus } from './types'

export interface BookFilters {
  q?: string
  status?: ReadingStatus
  minRate?: number
}

export function listBooks(page: number, size: number, filters: BookFilters = {}) {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (filters.q) params.set('q', filters.q)
  if (filters.status) params.set('status', filters.status)
  if (filters.minRate !== undefined) params.set('minRate', String(filters.minRate))
  return api<Page<Book>>(`/api/books?${params}`)
}

export function getBook(id: string) {
  return api<Book>(`/api/books/${id}`)
}

export function createBook(data: BookRequest) {
  return api<Book>('/api/books', { method: 'POST', body: data })
}

export function updateBook(id: string, data: BookRequest) {
  return api<Book>(`/api/books/${id}`, { method: 'PUT', body: data })
}

export function deleteBook(id: string) {
  return api<void>(`/api/books/${id}`, { method: 'DELETE' })
}
