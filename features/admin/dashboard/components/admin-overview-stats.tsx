'use client'

import Link from 'next/link'
import { Users, CreditCard, Globe, TicketCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { ROUTES } from '@/lib/constants/routes'

interface AdminOverviewStatsProps {
  stats: {
    totalClients: number
    activeSubscriptions: number
    liveSites: number
    openTickets: number
  }
}

export function AdminOverviewStats({ stats }: AdminOverviewStatsProps): React.JSX.Element {
  const subscriptionRate = stats.totalClients > 0
    ? (stats.activeSubscriptions / stats.totalClients) * 100
    : 0

  const liveRate = stats.activeSubscriptions > 0
    ? (stats.liveSites / stats.activeSubscriptions) * 100
    : 0

  return (
    <TooltipProvider>
      <ItemGroup
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        aria-label="Platform statistics"
      >
        <Item variant="outline" role="listitem" aria-label="Total clients metric">
          <ItemMedia variant="icon">
            <Users aria-hidden="true" />
          </ItemMedia>
          <ItemHeader>
            <ItemTitle>Total Clients</ItemTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary">{stats.totalClients}</Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Registered client accounts</p>
              </TooltipContent>
            </Tooltip>
          </ItemHeader>
          <ItemContent>
            <ItemDescription>
              {stats.activeSubscriptions} active subscriptions
            </ItemDescription>
            <div className="mt-3 space-y-2">
              <Progress value={subscriptionRate} aria-label="Subscription rate" />
              <ItemDescription>
                <span className="text-xs">{subscriptionRate.toFixed(1)}% subscription rate</span>
              </ItemDescription>
            </div>
          </ItemContent>
          <ItemFooter>
            <Button asChild variant="link" size="sm">
              <Link href={ROUTES.ADMIN_CLIENTS}>View all</Link>
            </Button>
          </ItemFooter>
        </Item>

        <Item variant="outline" role="listitem" aria-label="Active subscriptions metric">
          <ItemMedia variant="icon">
            <CreditCard aria-hidden="true" />
          </ItemMedia>
          <ItemHeader>
            <ItemTitle>Active Subscriptions</ItemTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="default">{stats.activeSubscriptions}</Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Paying client subscriptions</p>
              </TooltipContent>
            </Tooltip>
          </ItemHeader>
          <ItemContent>
            <ItemDescription>
              Paying clients with active plans
            </ItemDescription>
          </ItemContent>
          <ItemFooter>
            <Button asChild variant="link" size="sm">
              <Link href={ROUTES.ADMIN_CLIENTS}>Manage subscriptions</Link>
            </Button>
          </ItemFooter>
        </Item>

        <Item variant="outline" role="listitem" aria-label="Live sites metric">
          <ItemMedia variant="icon">
            <Globe aria-hidden="true" />
          </ItemMedia>
          <ItemHeader>
            <ItemTitle>Live Sites</ItemTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="default">{stats.liveSites}</Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Deployed websites</p>
              </TooltipContent>
            </Tooltip>
          </ItemHeader>
          <ItemContent>
            <ItemDescription>
              Active website deployments
            </ItemDescription>
            <div className="mt-3 space-y-2">
              <Progress value={liveRate} aria-label="Deployment rate" />
              <ItemDescription>
                <span className="text-xs">{liveRate.toFixed(1)}% deployment rate</span>
              </ItemDescription>
            </div>
          </ItemContent>
          <ItemFooter>
            <Button asChild variant="link" size="sm">
              <Link href={ROUTES.ADMIN_SITES}>View all</Link>
            </Button>
          </ItemFooter>
        </Item>

        <Item variant="outline" role="listitem" aria-label="Open tickets metric">
          <ItemMedia variant="icon">
            <TicketCheck aria-hidden="true" />
          </ItemMedia>
          <ItemHeader>
            <ItemTitle>Open Tickets</ItemTitle>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant={stats.openTickets > 0 ? 'destructive' : 'secondary'}>
                  {stats.openTickets}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {stats.openTickets > 0
                    ? 'Tickets requiring attention'
                    : 'No open tickets'}
                </p>
              </TooltipContent>
            </Tooltip>
          </ItemHeader>
          <ItemContent>
            <ItemDescription>
              {stats.openTickets > 0 ? 'Needs attention' : 'All clear'}
            </ItemDescription>
          </ItemContent>
          <ItemFooter>
            <Button asChild variant="link" size="sm">
              <Link href={ROUTES.ADMIN_SUPPORT}>
                {stats.openTickets > 0 ? 'View tickets' : 'View all'}
              </Link>
            </Button>
          </ItemFooter>
        </Item>
      </ItemGroup>
    </TooltipProvider>
  )
}
