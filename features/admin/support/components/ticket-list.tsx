'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { MessageSquare } from 'lucide-react'
import type { TicketWithProfile } from '../api/queries'
import type { TicketPriority, TicketStatus } from '@/lib/types/database-aliases'
import {
  getTicketStatusVariant,
  getTicketPriorityVariant,
  getTicketStatusLabel,
  getTicketPriorityLabel,
} from '@/features/admin/support/utils'

interface TicketListProps {
  tickets: TicketWithProfile[]
  basePath: string
}

const ITEMS_PER_PAGE = 10

export function TicketList({ tickets, basePath }: TicketListProps): React.JSX.Element {
  const [currentPage, setCurrentPage] = useState(1)
  if (tickets.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MessageSquare />
          </EmptyMedia>
          <EmptyTitle>No tickets yet</EmptyTitle>
          <EmptyDescription>
            Create a support request to start a conversation with our team.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <p className="text-muted-foreground">
            We&rsquo;ll notify you by email as soon as a ticket is opened.
          </p>
        </EmptyContent>
      </Empty>
    )
  }

  // Calculate pagination
  const totalPages = Math.ceil(tickets.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedTickets = tickets.slice(startIndex, endIndex)

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      if (currentPage > 3) {
        pages.push('ellipsis')
      }
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      if (currentPage < totalPages - 2) {
        pages.push('ellipsis')
      }
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div className="space-y-4">
      <ItemGroup className="space-y-3">
        <Item variant="outline">
          <ItemHeader>
            <ItemTitle>Support Tickets</ItemTitle>
            <ItemDescription>View recent conversations with our team.</ItemDescription>
          </ItemHeader>
        </Item>
        {paginatedTickets.map((ticket) => {
          const createdAt = new Date(ticket.created_at)

          return (
            <Item asChild key={ticket.id}>
              <Link
                href={`${basePath}/${ticket.id}`}
                aria-label={`Open ticket ${ticket.subject}`}
              >
                <ItemMedia>
                  <MessageSquare className="size-4 text-muted-foreground" aria-hidden="true" />
                </ItemMedia>
                <ItemContent className="min-w-0 gap-1">
                  <ItemTitle>{ticket.subject}</ItemTitle>
                  <ItemDescription>
                    {ticket.category?.replace('_', ' ') || 'Uncategorized'} • {createdAt.toLocaleDateString()}
                  </ItemDescription>
                </ItemContent>
                <ItemActions className="gap-2">
                  <Badge variant={getTicketPriorityVariant(ticket.priority as TicketPriority)}>
                    {getTicketPriorityLabel(ticket.priority as TicketPriority)}
                  </Badge>
                  <Badge variant={getTicketStatusVariant(ticket.status as TicketStatus)}>
                    {getTicketStatusLabel(ticket.status as TicketStatus)}
                  </Badge>
                </ItemActions>
              </Link>
            </Item>
          )
        })}
      </ItemGroup>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage > 1) {
                    setCurrentPage(currentPage - 1)
                  }
                }}
                aria-disabled={currentPage === 1}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {getPageNumbers().map((page, index) => (
              <PaginationItem key={`${page}-${index}`}>
                {page === 'ellipsis' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage(page)
                    }}
                    isActive={currentPage === page}
                    aria-label={`Go to page ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (currentPage < totalPages) {
                    setCurrentPage(currentPage + 1)
                  }
                }}
                aria-disabled={currentPage === totalPages}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
