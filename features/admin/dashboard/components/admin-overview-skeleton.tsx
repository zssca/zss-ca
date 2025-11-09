'use client'

import { Skeleton } from '@/components/ui/skeleton'
import {
  Item,
  ItemContent,
  ItemHeader,
  ItemMedia
} from '@/components/ui/item'

export function AdminOverviewSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-6">
      {/* Stats Section Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" role="list" aria-label="Loading statistics">
        {Array.from({ length: 4 }).map((_, index) => (
          <Item variant="outline" role="listitem" key={index}>
            <ItemMedia variant="icon">
              <Skeleton className="size-5 rounded" />
            </ItemMedia>
            <ItemHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </ItemHeader>
            <ItemContent>
              <Skeleton className="h-3 w-32" />
              <div className="mt-3 space-y-2">
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </ItemContent>
          </Item>
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid auto-rows-[minmax(0,1fr)] gap-4 lg:grid-cols-2 xl:grid-cols-3 items-stretch" role="list" aria-label="Loading analytics">
        {/* Growth Trend Chart Skeleton */}
        <Item role="listitem" variant="outline" className="h-full">
          <ItemHeader className="flex-col items-start gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-48" />
          </ItemHeader>
          <ItemContent>
            <Skeleton className="h-[200px] w-full" />
          </ItemContent>
        </Item>

        {/* Subscription Distribution Chart Skeleton */}
        <Item role="listitem" variant="outline" className="h-full">
          <ItemHeader className="flex-col items-start gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-36" />
          </ItemHeader>
          <ItemContent>
            <Skeleton className="h-[200px] w-full rounded-full mx-auto" />
          </ItemContent>
        </Item>

        {/* Site Status Chart Skeleton */}
        <Item role="listitem" variant="outline" className="h-full">
          <ItemHeader className="flex-col items-start gap-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-44" />
          </ItemHeader>
          <ItemContent>
            <Skeleton className="h-[200px] w-full" />
          </ItemContent>
        </Item>

        {/* Actions Section Skeleton */}
        <div role="listitem" className="h-full lg:col-span-2 xl:col-span-3">
          <Item variant="outline" className="h-full">
            <ItemHeader className="flex-col items-start gap-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-52" />
            </ItemHeader>
            <ItemContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            </ItemContent>
          </Item>
        </div>
      </div>

      {/* Recent Activity Section Skeleton */}
      <div className="grid auto-rows-[minmax(0,1fr)] gap-4 lg:grid-cols-2 items-stretch" role="list" aria-label="Loading recent activity">
        {/* Recent Clients Skeleton */}
        <Item role="listitem" variant="outline" className="h-full">
          <ItemHeader className="flex-col items-start gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-40" />
          </ItemHeader>
          <ItemContent className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Item key={index} variant="outline">
                <ItemMedia variant="image">
                  <Skeleton className="size-10 rounded-full" />
                </ItemMedia>
                <ItemContent>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </ItemContent>
              </Item>
            ))}
          </ItemContent>
        </Item>

        {/* Recent Tickets Skeleton */}
        <Item role="listitem" variant="outline" className="h-full">
          <ItemHeader className="flex-col items-start gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-44" />
          </ItemHeader>
          <ItemContent className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Item key={index} variant="outline">
                <ItemContent className="space-y-2">
                  <ItemHeader className="items-center justify-between">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </ItemHeader>
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </ItemContent>
              </Item>
            ))}
          </ItemContent>
        </Item>
      </div>
    </div>
  )
}
