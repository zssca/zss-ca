'use client'

import Link from 'next/link'
import { Globe, Users as UsersIcon, Ticket } from 'lucide-react'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { ROUTES } from '@/lib/constants/routes'

interface AdminQuickActionsGridProps {
  stats: {
    totalClients: number
    activeSubscriptions: number
    liveSites: number
    openTickets: number
  }
}

export function AdminQuickActionsGrid({ stats }: AdminQuickActionsGridProps): React.JSX.Element {
  const actions = [
    {
      title: 'Manage Clients',
      description: 'View and edit client accounts',
      href: ROUTES.ADMIN_CLIENTS,
      icon: UsersIcon,
      highlight: `${stats.totalClients} total`
        + (stats.activeSubscriptions > 0 ? ` • ${stats.activeSubscriptions} active` : ''),
      secondaryCta: {
        label: 'View clients',
        href: ROUTES.ADMIN_CLIENTS,
      },
    },
    {
      title: 'View Sites',
      description: 'Browse all deployments',
      href: ROUTES.ADMIN_SITES,
      icon: Globe,
      highlight: `${stats.liveSites} live deployments`,
      secondaryCta: {
        label: 'Open sites',
        href: ROUTES.ADMIN_SITES,
      },
    },
    {
      title: 'Review Tickets',
      description: 'Respond to support requests',
      href: ROUTES.ADMIN_SUPPORT,
      icon: Ticket,
      highlight: stats.openTickets > 0 ? `${stats.openTickets} awaiting response` : 'All caught up',
      secondaryCta: {
        label: 'Go to support',
        href: ROUTES.ADMIN_SUPPORT,
      },
      primaryCta: {
        label: 'Create site',
        href: ROUTES.ADMIN_SITES_NEW,
      },
    },
  ]

  return (
    <ItemGroup className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Quick actions">
      {actions.map(({ title, description, href, icon: Icon, highlight, primaryCta, secondaryCta }) => (
        <HoverCard key={title} openDelay={150} closeDelay={150}>
          <HoverCardTrigger asChild>
            <Item
              variant="outline"
              asChild
              role="listitem"
              className="h-full cursor-pointer transition-colors hover:bg-accent/50"
            >
              <Link href={href} className="flex h-full flex-col">
                <ItemHeader className="items-start gap-3">
                  <ItemMedia variant="icon">
                    <Icon aria-hidden="true" />
                  </ItemMedia>
                  <div className="space-y-1">
                    <ItemTitle>{title}</ItemTitle>
                    <ItemDescription>{description}</ItemDescription>
                  </div>
                </ItemHeader>
                <ItemContent>
                  <p className="text-sm text-muted-foreground">{highlight}</p>
                </ItemContent>
              </Link>
            </Item>
          </HoverCardTrigger>
          <HoverCardContent className="w-72 space-y-3" align="start">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Snapshot</h4>
              <p className="text-sm text-muted-foreground">{highlight}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {primaryCta ? (
                <Button size="sm" asChild>
                  <Link href={primaryCta.href}>{primaryCta.label}</Link>
                </Button>
              ) : null}
              {secondaryCta ? (
                <Button size="sm" variant="outline" asChild>
                  <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
                </Button>
              ) : null}
            </div>
          </HoverCardContent>
        </HoverCard>
      ))}
    </ItemGroup>
  )
}
