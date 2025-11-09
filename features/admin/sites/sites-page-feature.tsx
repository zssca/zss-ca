import 'server-only'

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, Globe, Rocket, Clock, Pause } from 'lucide-react'
import { ROUTES } from '@/lib/constants/routes'
import { createClient } from '@/lib/supabase/server'
import { listSites } from './api/queries'
import { SitesCommandMenu, SitesTable } from './components'
import { Button } from '@/components/ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Separator } from '@/components/ui/separator'

export async function SitesPageFeature() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(ROUTES.LOGIN)

  // ✅ Parallel data fetching to avoid waterfall
  const [profileResult, sites] = await Promise.all([
    supabase.from('profile').select('role').eq('id', user.id).single(),
    listSites(),
  ])

  const { data: profile } = profileResult
  if (!profile || profile.role !== 'admin') redirect(ROUTES.CLIENT_DASHBOARD)

  // Calculate statistics
  const stats = {
    total: sites.length,
    live: sites.filter(s => s.status === 'live').length,
    inProduction: sites.filter(s => s.status === 'in_production').length,
    pending: sites.filter(s => s.status === 'pending' || s.status === 'awaiting_client_content').length,
    paused: sites.filter(s => s.status === 'paused' || s.status === 'archived').length,
  }

  const livePercentage = stats.total > 0 ? Math.round((stats.live / stats.total) * 100) : 0
  const siteSummaries = sites.map((site) => ({
    id: site.id,
    name: site.site_name,
    status: site.status,
    clientName: site.profile.company_name
      || site.profile.contact_name
      || site.profile.contact_email
      || '',
  }))

  return (
    <div className="space-y-6">
      <SitesCommandMenu sites={siteSummaries} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Overview</h2>
        <Button asChild>
          <Link href={ROUTES.ADMIN_SITES_NEW} aria-label="Create a new site">
            <Plus className="mr-2 size-4" aria-hidden="true" />
            Create Site
          </Link>
        </Button>
      </div>

      {/* Statistics Overview */}
      <ItemGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Site status summary">
        <Item variant="outline" role="listitem">
          <ItemHeader className="items-center gap-3">
            <ItemMedia variant="icon">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Globe className="size-5 text-primary" aria-hidden="true" />
              </div>
            </ItemMedia>
            <div>
              <ItemTitle>Total Sites</ItemTitle>
              <ItemDescription>Cumulative deployments</ItemDescription>
            </div>
            <ItemActions>
              <span className="text-2xl font-semibold">{stats.total}</span>
            </ItemActions>
          </ItemHeader>
        </Item>

        <Item variant="outline" role="listitem">
          <ItemHeader className="items-center gap-3">
            <ItemMedia variant="icon">
              <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10 dark:bg-green-500/20">
                <Rocket className="size-5 text-green-600 dark:text-green-400" aria-hidden="true" />
              </div>
            </ItemMedia>
            <div>
              <ItemTitle>Live Sites</ItemTitle>
              <ItemDescription>Currently serving traffic</ItemDescription>
            </div>
            <ItemActions>
              <span className="text-2xl font-semibold">{stats.live}</span>
            </ItemActions>
          </ItemHeader>
        </Item>

        <Item variant="outline" role="listitem">
          <ItemHeader className="items-center gap-3">
            <ItemMedia variant="icon">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                <Clock className="size-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
            </ItemMedia>
            <div>
              <ItemTitle>In Production</ItemTitle>
              <ItemDescription>Deployments in progress</ItemDescription>
            </div>
            <ItemActions>
              <span className="text-2xl font-semibold">{stats.inProduction}</span>
            </ItemActions>
          </ItemHeader>
        </Item>

        <Item variant="outline" role="listitem">
          <ItemHeader className="items-center gap-3">
            <ItemMedia variant="icon">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 dark:bg-amber-500/20">
                <Pause className="size-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              </div>
            </ItemMedia>
            <div>
              <ItemTitle>Pending / Paused</ItemTitle>
              <ItemDescription>Waiting on content or approvals</ItemDescription>
            </div>
            <ItemActions>
              <span className="text-2xl font-semibold">{stats.pending + stats.paused}</span>
            </ItemActions>
          </ItemHeader>
        </Item>
      </ItemGroup>

      {/* Deployment Progress */}
      <Item variant="outline" role="region" aria-label="Deployment progress summary">
        <ItemHeader className="flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <ItemTitle>Deployment Progress</ItemTitle>
            <ItemDescription>Share of live sites across the pipeline</ItemDescription>
          </div>
          <ItemActions>
            <span className="text-sm font-semibold text-foreground">{livePercentage}% Live</span>
          </ItemActions>
        </ItemHeader>
        <ItemContent className="space-y-4">
          <div
            className="flex h-2 w-full overflow-hidden rounded-full bg-muted"
            role="img"
            aria-label="Deployment progress by status"
          >
            {[
              { key: 'live', count: stats.live, color: 'bg-emerald-500 dark:bg-emerald-600', label: 'Live' },
              { key: 'in_production', count: stats.inProduction, color: 'bg-blue-500 dark:bg-blue-600', label: 'In production' },
              { key: 'pending', count: stats.pending, color: 'bg-amber-500 dark:bg-amber-600', label: 'Pending' },
              { key: 'paused', count: stats.paused, color: 'bg-muted-foreground/50', label: 'Paused' },
            ].map(({ key, count, color }) => {
              const width = stats.total > 0 ? (count / stats.total) * 100 : 0
              return (
                <span
                  key={key}
                  aria-hidden="true"
                  className={`h-full ${color}`}
                  style={{ width: `${width}%` }}
                />
              )
            })}
          </div>
          <dl className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-4">
            {[
              { label: 'Live', count: stats.live, color: 'bg-emerald-500 dark:bg-emerald-600' },
              { label: 'Production', count: stats.inProduction, color: 'bg-blue-500 dark:bg-blue-600' },
              { label: 'Pending', count: stats.pending, color: 'bg-amber-500 dark:bg-amber-600' },
              { label: 'Paused', count: stats.paused, color: 'bg-muted-foreground/50' },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`size-3 rounded-full ${color}`} aria-hidden="true" />
                <span>
                  <span className="sr-only">{label} sites: </span>
                  {label}: {count}
                </span>
              </div>
            ))}
          </dl>
        </ItemContent>
      </Item>

      <Separator />

      <SitesTable sites={sites} />
    </div>
  )
}
