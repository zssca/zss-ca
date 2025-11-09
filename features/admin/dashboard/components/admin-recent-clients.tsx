'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from '@/components/ui/item'
import { ClientSearchField } from './client-search-field'
import { RecentClientsTable } from './recent-clients-table'
import { ROUTES } from '@/lib/constants/routes'
import { MoreHorizontal } from 'lucide-react'

interface AdminRecentClientsProps {
  clients: Array<{
    id: string
    contact_name: string | null
    contact_email: string | null
    company_name: string | null
    created_at: string
  }>
  className?: string
}

export function AdminRecentClients({ clients, className }: AdminRecentClientsProps): React.JSX.Element {
  const [query, setQuery] = useState('')

  // React Compiler automatically memoizes this simple filtering
  const term = query.trim().toLowerCase()
  const filteredClients = !term
    ? clients
    : clients.filter((client) => {
        const values = [
          client.contact_name,
          client.contact_email,
          client.company_name,
        ]

        return values.some((value) =>
          value?.toLowerCase().includes(term),
        )
      })

  const hasClients = clients.length > 0
  const hasResults = filteredClients.length > 0

  const Header = (
    <ItemHeader className="flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <ItemTitle>Recent Clients</ItemTitle>
        <ItemDescription>Latest registered client accounts</ItemDescription>
      </div>
      <ItemActions className="flex flex-wrap gap-2" role="group" aria-label="Client management actions">
        <Button asChild size="sm">
          <Link href={ROUTES.ADMIN_CLIENTS}>Manage Clients</Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="size-4" aria-hidden="true" />
              <span className="sr-only">Open client actions menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`${ROUTES.ADMIN_CLIENTS}?filter=new`}>View new clients</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`${ROUTES.ADMIN_CLIENTS}?filter=inactive`}>Filter inactive</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`${ROUTES.ADMIN_CLIENTS}?export=csv`}>Export CSV</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ItemActions>
    </ItemHeader>
  )

  if (!hasClients) {
    return (
      <Item variant="outline" className={className} role="listitem">
        {Header}
        <ItemContent className="basis-full">
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyTitle>No clients yet</EmptyTitle>
              <EmptyDescription>
                Client accounts will appear here once registered
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </ItemContent>
      </Item>
    )
  }

  return (
    <Item variant="outline" className={className} role="listitem">
      {Header}
      <ItemContent className="basis-full space-y-4">
        <ClientSearchField
          query={query}
          onQueryChange={setQuery}
          resultsCount={filteredClients.length}
        />
        {hasResults ? (
          <RecentClientsTable clients={filteredClients} />
        ) : (
          <Empty className="py-8" aria-live="polite">
            <EmptyHeader>
              <EmptyTitle>No matching clients</EmptyTitle>
              <EmptyDescription>
                Try adjusting your search terms or clearing the filter
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button type="button" variant="outline" onClick={() => setQuery('')}>
                Clear filter
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </ItemContent>
    </Item>
  )
}
