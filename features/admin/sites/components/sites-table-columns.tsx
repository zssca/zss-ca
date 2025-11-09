'use client'

import Link from 'next/link'
import type { ColumnDef } from '@tanstack/react-table'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ROUTES, ROUTE_HELPERS } from '@/lib/constants/routes'
import { getStatusVariant, formatStatus } from '@/features/shared/utils'
import { STATUS_DESCRIPTIONS, STATUS_FILTERS } from './sites-table.constants'
import type { SiteWithRelations } from './sites-table.types'

export const siteColumns: ColumnDef<SiteWithRelations>[] = [
  {
    accessorKey: 'site_name',
    header: 'Site',
    cell: ({ row }) => (
      <div className="font-medium text-sm">{row.original.site_name}</div>
    ),
  },
  {
    id: 'client',
    header: 'Client',
    cell: ({ row }) => {
      const client = row.original.profile
      const displayName = client.company_name || client.contact_name || 'Unknown client'
      const contactEmail = client.contact_email || 'No email on file'

      return (
        <div className="space-y-1">
          <HoverCard>
            <HoverCardTrigger asChild>
              <button type="button" className="text-left text-sm font-medium hover:underline focus:outline-none">
                {displayName}
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-72 space-y-3" align="start">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">{displayName}</h4>
                <p className="text-xs text-muted-foreground">{contactEmail}</p>
              </div>
              {row.original.plan && row.original.subscription && (
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{row.original.plan.name}</Badge>
                  <span aria-hidden="true">•</span>
                  <span>{formatStatus(row.original.subscription.status)}</span>
                </div>
              )}
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link href={ROUTE_HELPERS.adminClientDetail(client.id)}>View client profile</Link>
              </Button>
            </HoverCardContent>
          </HoverCard>
          <div className="text-xs text-muted-foreground">
            {client.contact_email ? (
              <a className="hover:text-primary" href={`mailto:${client.contact_email}`}>
                {client.contact_email}
              </a>
            ) : (
              'No email'
            )}
          </div>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'plan.name',
    header: 'Plan',
    cell: ({ row }) => (
      row.original.plan ? (
        <Badge variant="outline" className="text-xs font-medium">{row.original.plan.name}</Badge>
      ) : (
        <span className="text-sm text-muted-foreground">No plan</span>
      )
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={getStatusVariant(row.original.status)}>
              {formatStatus(row.original.status)}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs text-sm text-muted-foreground">
              {STATUS_DESCRIPTIONS[row.original.status] || 'Status information unavailable.'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
    filterFn: (row, id, value) => {
      if (!Array.isArray(value) || value.length === 0) return true
      return value.some((filter) => STATUS_FILTERS[filter]?.includes(row.getValue(id)))
    },
  },
  {
    accessorKey: 'deployment_url',
    header: 'Deployed URL',
    cell: ({ row }) => (
      row.original.deployment_url ? (
        <a
          href={row.original.deployment_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          View site
        </a>
      ) : (
        <span className="text-sm text-muted-foreground">Not deployed</span>
      )
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'updated_at',
    header: 'Updated',
    cell: ({ row }) => {
      const updatedAt = row.original.updated_at
        ? new Date(row.original.updated_at)
        : row.original.created_at
          ? new Date(row.original.created_at)
          : null
      return (
        <span className="text-xs text-muted-foreground">
          {updatedAt ? formatDistanceToNow(updatedAt, { addSuffix: true }) : '—'}
        </span>
      )
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" aria-label={`Manage ${row.original.site_name}`}>
            Manage
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Site actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={ROUTE_HELPERS.adminSiteDetail(row.original.id)}>View details</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`${ROUTES.ADMIN_CLIENTS}?site=${row.original.id}`}>View client</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`${ROUTES.ADMIN_SUPPORT}?site=${row.original.id}`}>Support tickets</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableSorting: false,
    enableHiding: false,
  },
]
