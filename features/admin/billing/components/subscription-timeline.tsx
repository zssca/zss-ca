"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import type { ReactNode } from "react"
import {
  ArrowUpIcon,
  ArrowDownIcon,
  XCircleIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  RefreshCwIcon
} from "lucide-react"
import type { SubscriptionTimelineEvent } from "../api/queries/subscription-history"

interface SubscriptionTimelineProps {
  events: SubscriptionTimelineEvent[]
  isLoading?: boolean
}

function getEventIcon(eventType: string) {
  switch (eventType) {
    case "upgrade":
      return <ArrowUpIcon className="h-4 w-4 text-green-600" />
    case "downgrade":
      return <ArrowDownIcon className="h-4 w-4 text-amber-600" />
    case "cancellation":
      return <XCircleIcon className="h-4 w-4 text-red-600" />
    case "reactivation":
      return <CheckCircleIcon className="h-4 w-4 text-green-600" />
    case "creation":
      return <PlayIcon className="h-4 w-4 text-blue-600" />
    case "paused":
      return <PauseIcon className="h-4 w-4 text-gray-600" />
    case "resumed":
      return <RefreshCwIcon className="h-4 w-4 text-blue-600" />
    default:
      return <RefreshCwIcon className="h-4 w-4 text-gray-600" />
  }
}

function getEventBadgeVariant(eventType: string): "default" | "secondary" | "destructive" | "outline" {
  switch (eventType) {
    case "upgrade":
    case "reactivation":
    case "creation":
    case "resumed":
      return "default"
    case "downgrade":
    case "paused":
      return "secondary"
    case "cancellation":
      return "destructive"
    default:
      return "outline"
  }
}

function getEventDescription(event: SubscriptionTimelineEvent): string {
  const { event_type, from_plan, to_plan, from_status, to_status } = event

  switch (event_type) {
    case "upgrade":
      return `Upgraded from ${from_plan?.name || "Unknown"} to ${to_plan?.name || "Unknown"}`
    case "downgrade":
      return `Downgraded from ${from_plan?.name || "Unknown"} to ${to_plan?.name || "Unknown"}`
    case "cancellation":
      return `Subscription cancelled (was on ${from_plan?.name || "Unknown"})`
    case "reactivation":
      return `Subscription reactivated to ${to_plan?.name || "Unknown"}`
    case "creation":
      return `Subscription created on ${to_plan?.name || "Unknown"} plan`
    case "status_change":
      return `Status changed from ${from_status || "unknown"} to ${to_status || "unknown"}`
    case "paused":
      return "Subscription paused"
    case "resumed":
      return "Subscription resumed"
    default:
      return `Subscription ${event_type}`
  }
}

function getMRRChangeDisplay(mrrChange: number | null): ReactNode {
  if (mrrChange === null || mrrChange === 0) return null

  const isPositive = mrrChange > 0
  const Icon = isPositive ? ArrowUpIcon : ArrowDownIcon
  const colorClass = isPositive ? "text-green-600" : "text-red-600"

  return (
    <div className={`flex items-center gap-1 text-sm font-medium ${colorClass}`}>
      <Icon className="h-3 w-3" />
      {formatCurrency(Math.abs(mrrChange), { currency: "USD" })}/mo
    </div>
  )
}

export function SubscriptionTimeline({ events, isLoading }: SubscriptionTimelineProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Timeline</CardTitle>
          <CardDescription>Loading subscription history...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Timeline</CardTitle>
          <CardDescription>No subscription history available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No subscription changes have been recorded yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Timeline</CardTitle>
        <CardDescription>
          History of subscription changes and upgrades/downgrades
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {events.map((event, index) => (
            <div key={event.id} className="relative">
              {/* Connecting line */}
              {index < events.length - 1 && (
                <div className="absolute left-4 top-8 bottom-0 w-px bg-border" />
              )}

              <div className="flex gap-4">
                {/* Icon */}
                <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted">
                  {getEventIcon(event.event_type)}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={getEventBadgeVariant(event.event_type)}>
                          {event.event_type.replace("_", " ")}
                        </Badge>
                        {getMRRChangeDisplay(event.mrr_change)}
                      </div>
                      <p className="text-sm font-medium">
                        {getEventDescription(event)}
                      </p>
                      {event.reason && (
                        <p className="text-sm text-muted-foreground">
                          Reason: {event.reason}
                        </p>
                      )}
                      {event.prorated_amount !== null && event.prorated_amount !== 0 && (
                        <p className="text-sm text-muted-foreground">
                          Prorated amount: {formatCurrency(event.prorated_amount, { currency: "USD" })}
                        </p>
                      )}
                      {event.profile && (
                        <p className="text-xs text-muted-foreground">
                          Customer: {event.profile.full_name || event.profile.email}
                        </p>
                      )}
                    </div>
                    <time className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(event.occurred_at)}
                    </time>
                  </div>

                  {/* Revenue impact */}
                  {(event.mrr_change !== null || event.arr_change !== null) && (
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      {event.mrr_change !== null && event.mrr_change !== 0 && (
                        <div>
                          MRR Impact: {event.mrr_change > 0 ? "+" : ""}
                          {formatCurrency(event.mrr_change, { currency: "USD" })}
                        </div>
                      )}
                      {event.arr_change !== null && event.arr_change !== 0 && (
                        <div>
                          ARR Impact: {event.arr_change > 0 ? "+" : ""}
                          {formatCurrency(event.arr_change, { currency: "USD" })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Changed by info */}
                  {event.changed_by && (
                    <p className="text-xs text-muted-foreground">
                      Changed by: {event.changed_by}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function SubscriptionTimelineSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
