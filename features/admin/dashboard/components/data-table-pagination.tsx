'use client'

import { useState, useTransition } from 'react'
import type { Table } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

type PaginationDirection = 'previous' | 'next' | null

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const [pendingDirection, setPendingDirection] = useState<PaginationDirection>(null)

  const handlePageChange = (direction: Exclude<PaginationDirection, null>, action: () => void) => {
    setPendingDirection(direction)
    startTransition(() => {
      action()
      setPendingDirection(null)
    })
  }

  const totalResults = table.getFilteredRowModel().rows.length
  const isPreviousPending = isPending && pendingDirection === 'previous'
  const isNextPending = isPending && pendingDirection === 'next'

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground" aria-live="polite">
        {isPending ? 'Updating results…' : `${totalResults} results`}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange('previous', () => table.previousPage())}
          disabled={!table.getCanPreviousPage() || isPending}
        >
          {isPreviousPending ? (
            <>
              <Spinner aria-hidden="true" className="mr-2 size-4" />
              <span className="sr-only">Loading previous page</span>
            </>
          ) : null}
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange('next', () => table.nextPage())}
          disabled={!table.getCanNextPage() || isPending}
        >
          {isNextPending ? (
            <>
              <Spinner aria-hidden="true" className="mr-2 size-4" />
              <span className="sr-only">Loading next page</span>
            </>
          ) : null}
          Next
        </Button>
      </div>
    </div>
  )
}
