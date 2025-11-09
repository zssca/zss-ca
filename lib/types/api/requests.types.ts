/**
 * Common request pattern helpers for consistent filtering, sorting, and pagination.
 */

export type SortDirection = 'asc' | 'desc'

export interface SortOption<Field extends string = string> {
  field: Field
  direction: SortDirection
  nullsLast?: boolean
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'ilike'
  | 'contains'
  | 'contained'

export interface FilterRule<
  Field extends string = string,
  Value = string | number | boolean | null,
> {
  field: Field
  operator: FilterOperator
  value: Value
}

export interface QueryOptions<Field extends string = string> {
  pagination?: PaginationParams
  sorts?: SortOption<Field>[]
  filters?: FilterRule<Field>[]
  search?: {
    term: string
    fields: Field[]
  }
}

export interface MutationRequest<TPayload> {
  requestId?: string
  payload: TPayload
  metadata?: Record<string, unknown>
}
