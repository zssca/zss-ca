/**
 * Shared API response helpers used by Server Actions and Route Handlers.
 * Keep these types small and composable so that downstream code can reuse them.
 */

export interface ApiSuccess<T> {
  success: true
  data: T
  message?: string
  meta?: Record<string, unknown>
}

export interface ApiError {
  success: false
  error: string
  code?: string
  details?: Record<string, string[]>
  retryable?: boolean
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  links?: {
    next?: string
    previous?: string
  }
}

export interface SearchResponse<T> {
  results: T[]
  query: string
  totalResults: number
  searchTimeMs: number
  facets?: Record<string, Array<{ value: string; count: number }>>
}

export interface BulkOperationResponse<T> {
  successful: T[]
  failed: Array<{
    item: T
    error: string
  }>
  summary: {
    total: number
    succeeded: number
    failed: number
  }
}
