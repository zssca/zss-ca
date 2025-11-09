import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { MessageSquare } from 'lucide-react'
import type { TicketWithProfile } from '../api/queries'
import type { TicketPriority, TicketStatus } from '@/lib/types/database-aliases'
import {
  getTicketStatusVariant,
  getTicketPriorityVariant,
  getTicketStatusLabel,
  getTicketPriorityLabel,
} from '@/features/client/support/utils'

interface TicketListProps {
  tickets: TicketWithProfile[]
  basePath: string
}

export function TicketList({ tickets, basePath }: TicketListProps): React.JSX.Element {
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

  return (
    <ItemGroup className="space-y-3">
      <Item variant="outline">
        <ItemHeader>
          <ItemTitle>Support Tickets</ItemTitle>
          <ItemDescription>View recent conversations with our team.</ItemDescription>
        </ItemHeader>
      </Item>
      {tickets.map((ticket) => {
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
  )
}
