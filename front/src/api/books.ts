import { api } from './client'
import type { Book, BookRequest, Page } from './types'

export function listBooks(page: number, size: number) {
  return api<Page<Book>>(`/api/books?page=${page}&size=${size}`)
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
