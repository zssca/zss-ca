'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from '@/components/ui/item'
import { ROUTES } from '@/lib/constants/routes'
import { AdminTicketsSearch } from './admin-tickets-search'
import { AdminTicketsTable } from './admin-tickets-table'
import type { TicketPriority, TicketStatus } from '@/lib/types/database-aliases'
import { MoreHorizontal } from 'lucide-react'

interface AdminRecentTicketsProps {
  tickets: Array<{
    id: string
    subject: string
    status: TicketStatus
    priority: TicketPriority
    created_at: string
    profile: { contact_name: string | null; company_name: string | null } | null
  }>
  className?: string
}

export function AdminRecentTickets({ tickets, className }: AdminRecentTicketsProps): React.JSX.Element {
  const [query, setQuery] = useState('')

  // React Compiler automatically memoizes this simple filtering
  const term = query.trim().toLowerCase()
  const filteredTickets = !term
    ? tickets
    : tickets.filter((ticket) => {
        const values = [
          ticket.subject,
          ticket.priority,
          ticket.status,
          ticket.profile?.company_name,
          ticket.profile?.contact_name,
        ]

        return values.some((value) => value?.toLowerCase().includes(term))
      })

  const hasTickets = tickets.length > 0
  const hasResults = filteredTickets.length > 0

  const Header = (
    <ItemHeader className="flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <ItemTitle>Recent Support Tickets</ItemTitle>
        <ItemDescription>Latest customer support requests</ItemDescription>
      </div>
      <ItemActions className="flex flex-wrap gap-2" role="group" aria-label="Ticket management actions">
        <Button asChild size="sm">
          <Link href={ROUTES.ADMIN_SUPPORT}>Manage Tickets</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href={`${ROUTES.ADMIN_SUPPORT}/new`}>Create Ticket</Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="size-4" aria-hidden="true" />
              <span className="sr-only">Open ticket actions menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`${ROUTES.ADMIN_SUPPORT}?status=open`}>View open tickets</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`${ROUTES.ADMIN_SUPPORT}?priority=high`}>Filter high priority</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`${ROUTES.ADMIN_SUPPORT}?export=csv`}>Export CSV</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ItemActions>
    </ItemHeader>
  )

  if (!hasTickets) {
    return (
      <Item variant="outline" className={className} role="listitem">
        {Header}
        <ItemContent className="basis-full">
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyTitle>No tickets yet</EmptyTitle>
              <EmptyDescription>
                Support tickets will appear here when clients submit requests
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
        <AdminTicketsSearch
          query={query}
          setQuery={setQuery}
          resultCount={filteredTickets.length}
        />
        {hasResults ? (
          <AdminTicketsTable tickets={filteredTickets} />
        ) : (
          <Empty className="py-8" aria-live="polite">
            <EmptyHeader>
              <EmptyTitle>No matching tickets</EmptyTitle>
              <EmptyDescription>
                Adjust your search or clear the filter to view all recent support requests
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
