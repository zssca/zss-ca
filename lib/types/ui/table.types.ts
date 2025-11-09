import type { ReactNode } from 'react'

export type TableAlign = 'left' | 'center' | 'right'

export interface TableColumnDef<TData, TValue = ReactNode> {
  id: string
  header: ReactNode
  accessor: (row: TData) => TValue
  cell?: (value: TValue, row: TData) => ReactNode
  width?: string | number
  minWidth?: number
  align?: TableAlign
  meta?: Record<string, unknown>
}

export interface TableAction<TData> {
  id: string
  label: string
  icon?: ReactNode
  disabled?: (row: TData) => boolean
  onSelect: (row: TData) => Promise<void> | void
}

export type TableSortDirection = 'asc' | 'desc'

export interface TableSortState<TField extends string = string> {
  field: TField
  direction: TableSortDirection
}

export type RowSelectionState<RowId extends string | number = string> = {
  [rowId in RowId]?: boolean
}
