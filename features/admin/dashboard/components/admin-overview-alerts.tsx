'use client'

import Link from 'next/link'
import { AlertTriangle, Info } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'

interface AdminOverviewAlertsProps {
  showTicketAlert: boolean
  showConversionAlert: boolean
  openTickets: number
  subscriptionRate: number
}

export function AdminOverviewAlerts({
  showTicketAlert,
  showConversionAlert,
  openTickets,
  subscriptionRate,
}: AdminOverviewAlertsProps) {
  if (!showTicketAlert && !showConversionAlert) {
    return null
  }

  return (
    <ItemGroup className="grid auto-rows-[minmax(0,1fr)] gap-4 lg:grid-cols-2" aria-label="System alerts">
      {showTicketAlert ? (
        <Item
          role="listitem"
          variant="outline"
          className="h-full border-destructive/50 bg-destructive/5"
        >
          <ItemHeader className="items-start gap-3">
            <ItemMedia variant="icon" className="text-destructive">
              <AlertTriangle className="size-4" aria-hidden="true" />
            </ItemMedia>
            <div className="space-y-1">
              <ItemTitle className="text-destructive">High ticket volume</ItemTitle>
              <ItemDescription>Backlog exceeds SLA threshold.</ItemDescription>
            </div>
            <ItemActions>
              <Button asChild size="sm" variant="destructive">
                <Link href={ROUTES.ADMIN_SUPPORT}>Review queue</Link>
              </Button>
            </ItemActions>
          </ItemHeader>
          <ItemContent>
            <ItemDescription>
              {openTickets} open tickets require attention. Prioritize high priority requests to keep SLAs on track.
            </ItemDescription>
          </ItemContent>
        </Item>
      ) : null}

      {showConversionAlert ? (
        <Item
          role="listitem"
          variant="outline"
          className="h-full border-amber-500/40 bg-amber-500/10"
        >
          <ItemHeader className="items-start gap-3">
            <ItemMedia variant="icon" className="text-amber-600">
              <Info className="size-4" aria-hidden="true" />
            </ItemMedia>
            <div className="space-y-1">
              <ItemTitle className="text-amber-700">Conversion opportunity</ItemTitle>
              <ItemDescription>Inactive clients ready for outreach.</ItemDescription>
            </div>
            <ItemActions>
              <Button asChild size="sm" variant="secondary">
                <Link href={ROUTES.ADMIN_CLIENTS}>View list</Link>
              </Button>
            </ItemActions>
          </ItemHeader>
          <ItemContent>
            <ItemDescription>
              Only {Math.round(subscriptionRate)}% of clients hold active subscriptions. Create touchpoints for inactive accounts to improve MRR.
            </ItemDescription>
          </ItemContent>
        </Item>
      ) : null}
    </ItemGroup>
  )
}
