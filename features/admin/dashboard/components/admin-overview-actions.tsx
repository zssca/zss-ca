'use client'

import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AdminQuickActionsGrid } from './admin-quick-actions-grid'
import { cn } from '@/lib/utils/index'
import {
  Item,
  ItemActions,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from '@/components/ui/item'

interface AdminOverviewActionsProps {
  stats: {
    totalClients: number
    activeSubscriptions: number
    liveSites: number
    openTickets: number
  }
  className?: string
}

export function AdminOverviewActions({ stats, className }: AdminOverviewActionsProps): React.JSX.Element {
  return (
    <TooltipProvider>
      <div className={cn('space-y-4', className)}>
        <Item variant="muted" aria-label="Global search helper">
          <ItemHeader className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <ItemTitle>Global quick search</ItemTitle>
              <ItemDescription>Use the universal command palette to jump anywhere in the admin portal.</ItemDescription>
            </div>
            <ItemActions className="w-full justify-start sm:w-auto">
              <KbdGroup>
                <Kbd>⌘</Kbd>
                <span aria-hidden="true">+</span>
                <Kbd>K</Kbd>
              </KbdGroup>
            </ItemActions>
          </ItemHeader>
        </Item>
        <AdminQuickActionsGrid stats={stats} />
      </div>
    </TooltipProvider>
  )
}
