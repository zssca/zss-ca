'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type {
  ColumnFiltersState,
  SortingState,
} from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'
import { ROUTE_HELPERS } from '@/lib/constants/routes'
import { DataTableViewOptions } from '@/features/admin/dashboard/components/data-table-view-options'
import { STATUS_TOGGLE_OPTIONS } from './sites-table.constants'
import { siteColumns } from './sites-table-columns'
import type { SiteWithRelations } from './sites-table.types'
import { SitesTableSearch } from './sites-table-search'
import { SitesTableNoResults, SitesTableZeroState } from './sites-table-empty'

export function SitesTable({ sites }: { sites: SiteWithRelations[] }): React.JSX.Element {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({})
  const [globalFilter, setGlobalFilter] = useState('')

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: sites,
    columns: siteColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, filterValue) => {
      if (typeof filterValue !== 'string' || filterValue.trim() === '') {
        return true
      }
      const query = filterValue.trim().toLowerCase()
      const record = row.original
      return [
        record.site_name,
        record.profile.company_name,
        record.profile.contact_name,
        record.profile.contact_email,
        record.deployment_url,
        record.custom_domain,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    },
  })

  const statusFilterValues = (table.getColumn('status')?.getFilterValue() as string[]) ?? []
  const suggestions = table.getPreFilteredRowModel().rows.slice(0, 8).map((row) => ({
    id: row.original.id,
    siteName: row.original.site_name,
    clientLabel: row.original.profile.company_name
      || row.original.profile.contact_name
      || row.original.profile.contact_email
      || 'Unassigned',
  }))
  const filteredRowCount = table.getFilteredRowModel().rows.length

  if (sites.length === 0) {
    return <SitesTableZeroState />
  }

  return (
    <div className="space-y-4">
      <SitesTableSearch
        value={globalFilter}
        onValueChange={setGlobalFilter}
        suggestions={suggestions}
        onSelect={(id) => router.push(ROUTE_HELPERS.adminSiteDetail(id))}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup
          type="multiple"
          value={statusFilterValues}
          onValueChange={(values) => table.getColumn('status')?.setFilterValue(values)}
          className="flex flex-wrap gap-2"
          aria-label="Filter sites by status"
        >
          {STATUS_TOGGLE_OPTIONS.map((option) => (
            <ToggleGroupItem key={option.value} value={option.value} aria-label={`Show ${option.label.toLowerCase()} sites`}>
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <DataTableViewOptions table={table} />
      </div>

      <ScrollArea className="rounded-md border">
        <Table className="min-w-[720px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} scope="col">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={siteColumns.length} className="h-24 text-center">
                  No sites match the current filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {filteredRowCount === 0 && <SitesTableNoResults />}

      {filteredRowCount > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-muted-foreground">
            {filteredRowCount} {filteredRowCount === 1 ? 'result' : 'results'}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
