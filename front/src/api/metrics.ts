import { api } from './client'
import type { Metrics } from './types'

export function getMetrics(year?: number) {
  return api<Metrics>(year === undefined ? '/api/metrics' : `/api/metrics?year=${year}`)
}

export function setReadingGoal(year: number, target: number) {
  return api<void>(`/api/metrics/goals/${year}`, { method: 'PUT', body: { target } })
}

export function deleteReadingGoal(year: number) {
  return api<void>(`/api/metrics/goals/${year}`, { method: 'DELETE' })
}
