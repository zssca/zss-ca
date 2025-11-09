'use client'

import {
  MessageCircle,
  Clock,
  CheckCircle2,
  Archive,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import type { TicketWithProfile } from '@/features/admin/support/api/queries'

interface SupportStatsProps {
  tickets: TicketWithProfile[]
}

export function SupportStats({ tickets }: SupportStatsProps): React.JSX.Element {
  const openTickets = tickets.filter((t) => t.status === 'open')
  const inProgressTickets = tickets.filter((t) => t.status === 'in_progress')
  const resolvedTickets = tickets.filter((t) => t.status === 'resolved')
  const closedTickets = tickets.filter((t) => t.status === 'closed')

  const totalCount = tickets.length
  const openRate = totalCount > 0 ? (openTickets.length / totalCount) * 100 : 0
  const resolutionRate = totalCount > 0 ? (resolvedTickets.length / totalCount) * 100 : 0

  const stats = [
    {
      key: 'open',
      label: 'Open tickets',
      value: openTickets.length,
      description:
        openRate >= 35
          ? 'Queue load rising; triage new submissions first.'
          : 'Within SLA thresholds for first response.',
      badge: `${openRate.toFixed(0)}% open`,
      badgeIcon: openRate >= 35 ? TrendingUp : TrendingDown,
      footerHeadline: openRate >= 35 ? 'Queue load rising' : 'Queue under control',
      footerHelper: `${openTickets.length} conversations awaiting first response.`,
      icon: MessageCircle,
    },
    {
      key: 'in-progress',
      label: 'In progress',
      value: inProgressTickets.length,
      description: 'Reassign or unblock owners to keep momentum.',
      badge: `${inProgressTickets.length || '0'} active`,
      badgeIcon: inProgressTickets.length > 0 ? TrendingUp : TrendingDown,
      footerHeadline:
        inProgressTickets.length > 0 ? 'Agents actively engaged' : 'No active investigations',
      footerHelper: 'Tickets with ongoing collaboration.',
      icon: Clock,
    },
    {
      key: 'resolved',
      label: 'Resolved',
      value: resolvedTickets.length,
      description: 'Verify satisfaction before closing the loop.',
      badge: `${resolutionRate.toFixed(0)}%`,
      badgeIcon: resolutionRate >= 80 ? TrendingUp : TrendingDown,
      footerHeadline:
        resolutionRate >= 80 ? 'Resolution rate trending up' : 'Monitor for SLA risk',
      footerHelper: 'Marked as solved and pending confirmation.',
      icon: CheckCircle2,
    },
    {
      key: 'closed',
      label: 'Closed',
      value: closedTickets.length,
      description: 'Auto-archived after confirmation.',
      badge: `${closedTickets.length || '0'}`,
      badgeIcon: closedTickets.length > 0 ? TrendingUp : TrendingDown,
      footerHeadline:
        closedTickets.length > 0 ? 'Lifecycle complete' : 'Awaiting confirmations',
      footerHelper: 'Archived conversations for reference.',
      icon: Archive,
    },
  ]

  return (
    <ItemGroup className="grid grid-cols-1 gap-4 px-0 sm:grid-cols-2 lg:grid-cols-4" aria-label="Support ticket stats">
      {stats.map((stat) => {
        const TrendIcon = stat.badgeIcon
        return (
          <Item
            key={stat.key}
            variant="outline"
            role="listitem"
            className="@container/support-card from-primary/5 to-card bg-gradient-to-t shadow-xs"
          >
            <ItemHeader className="flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <ItemDescription>{stat.label}</ItemDescription>
                  <ItemTitle className="text-3xl font-semibold">{stat.value}</ItemTitle>
                </div>
                <ItemActions>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <TrendIcon className="size-3" aria-hidden="true" />
                    {stat.badge}
                  </Badge>
                </ItemActions>
              </div>
            </ItemHeader>
            <ItemContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <ItemMedia variant="icon" className="text-muted-foreground">
                  <stat.icon className="size-4" aria-hidden="true" />
                </ItemMedia>
                {stat.footerHeadline}
              </div>
              <p>{stat.footerHelper}</p>
              <p>{stat.description}</p>
            </ItemContent>
          </Item>
        )
      })}
    </ItemGroup>
  )
}
