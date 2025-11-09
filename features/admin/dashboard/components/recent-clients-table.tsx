'use client'

import { useState } from 'react'
import type {
  ColumnDef,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTableViewOptions } from './data-table-view-options'
import { DataTablePagination } from './data-table-pagination'

interface Client {
  id: string
  contact_name: string | null
  contact_email: string | null
  company_name: string | null
  created_at: string
}

interface ClientsTableProps {
  clients: Client[]
}

const columns: ColumnDef<Client>[] = [
  {
    accessorKey: 'contact_name',
    header: 'Client',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarFallback>
            {row.getValue<string>('contact_name')?.charAt(0).toUpperCase() ?? 'C'}
          </AvatarFallback>
        </Avatar>
        <span>{row.getValue<string>('contact_name') ?? 'Unknown'}</span>
      </div>
    ),
    filterFn: (row, id, value) => {
      const term = String(value ?? '').toLowerCase()
      if (!term) {
        return true
      }
      const name = row.getValue<string>(id)?.toLowerCase() ?? ''
      const email = row.original.contact_email?.toLowerCase() ?? ''
      const company = row.original.company_name?.toLowerCase() ?? ''
      return [name, email, company].some((field) => field.includes(term))
    },
  },
  {
    accessorKey: 'contact_email',
    header: 'Email',
  },
  {
    accessorKey: 'company_name',
    header: 'Company',
    cell: ({ row }) => row.getValue<string>('company_name') ?? '—',
  },
  {
    accessorKey: 'created_at',
    header: 'Joined',
    cell: ({ row }) => new Date(row.getValue<string>('created_at')).toLocaleDateString(),
  },
]

export function RecentClientsTable({ clients }: ClientsTableProps): React.JSX.Element {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({})

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: clients,
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  })

  const searchFilter = columnFilters.find((filter) => filter.id === 'contact_name')
  const searchValue = typeof searchFilter?.value === 'string' ? searchFilter.value : ''

  const handleSearchChange = (value: string) => {
    setColumnFilters((previousFilters) => {
      const withoutSearch = previousFilters.filter((filter) => filter.id !== 'contact_name')
      if (!value) {
        return withoutSearch
      }
      return [
        ...withoutSearch,
        { id: 'contact_name', value },
      ]
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Input
          value={searchValue}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder="Search by name or company..."
          className="w-full lg:max-w-xs"
        />
        <DataTableViewOptions table={table} />
      </div>

      <div className="rounded-md border">
        <Table>
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No clients found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
