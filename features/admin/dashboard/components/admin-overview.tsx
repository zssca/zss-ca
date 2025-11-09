'use client'

import { ItemGroup } from '@/components/ui/item'
import { AdminOverviewStats } from './admin-overview-stats'
import { AdminOverviewActions } from './admin-overview-actions'
import { AdminRecentClients } from './admin-recent-clients'
import { AdminRecentTickets } from './admin-recent-tickets'
import type { MonthlyGrowthData } from './growth-trend-chart'
import { GrowthTrendChart } from './growth-trend-chart'
import { SubscriptionDistributionChart } from './subscription-distribution-chart'
import { SiteStatusChart } from './site-status-chart'
import { DatabaseSummaryWidget } from '../../database/components/database-summary-widget'
import { AdminOverviewAlerts } from './admin-overview-alerts'
import type { TicketPriority, TicketStatus } from '@/lib/types/database-aliases'
import type { DatabaseHealth, RLSCoverage } from '../../database/api'

interface AdminOverviewProps {
  stats: {
    totalClients: number
    activeSubscriptions: number
    liveSites: number
    openTickets: number
    recentClients: Array<{
      id: string
      contact_name: string | null
      contact_email: string | null
      company_name: string | null
      created_at: string
    }>
    recentTickets: Array<{
      id: string
      subject: string
      status: TicketStatus
      priority: TicketPriority
      created_at: string
      profile_id: string
      profile: { contact_name: string | null; company_name: string | null } | null
    }>
    planDistribution: Record<string, number>
    statusDistribution: Record<string, number>
  }
  trendData: MonthlyGrowthData[]
  databaseHealth: DatabaseHealth[]
  rlsCoverage: RLSCoverage[]
}

export function AdminOverview({ stats, trendData, databaseHealth, rlsCoverage }: AdminOverviewProps): React.JSX.Element {
  const subscriptionRate = stats.totalClients > 0
    ? (stats.activeSubscriptions / stats.totalClients) * 100
    : 0

  const showTicketAlert = stats.openTickets > 5
  const showConversionAlert = stats.totalClients > 0 && subscriptionRate < 50
  const showSystemAlerts = showTicketAlert || showConversionAlert

  const sharedStats = {
    totalClients: stats.totalClients,
    activeSubscriptions: stats.activeSubscriptions,
    liveSites: stats.liveSites,
    openTickets: stats.openTickets,
  }

  return (
    <div className="space-y-10">
      <OverviewSection
        id="metrics"
        title="Key Metrics"
        description="Overview of core client and operations health"
      >
        <AdminOverviewStats stats={sharedStats} />
      </OverviewSection>

      {/* Database Health Section */}
      {databaseHealth.length > 0 && (
        <OverviewSection
          id="database"
          title="Database Health"
          description="Real-time database monitoring and security status"
        >
          <DatabaseSummaryWidget healthData={databaseHealth} rlsData={rlsCoverage} />
        </OverviewSection>
      )}

      {showSystemAlerts ? (
        <OverviewSection
          id="alerts"
          title="System Alerts"
          description="Important notifications requiring attention"
        >
          <AdminOverviewAlerts
            showTicketAlert={showTicketAlert}
            showConversionAlert={showConversionAlert}
            openTickets={stats.openTickets}
            subscriptionRate={subscriptionRate}
          />
        </OverviewSection>
      ) : null}

      <OverviewSection
        id="analytics"
        title="Analytics & Insights"
        description="Performance metrics and distribution charts"
      >
        <ItemGroup className="grid auto-rows-[minmax(0,1fr)] gap-4 lg:grid-cols-2 xl:grid-cols-3" aria-label="Analytics widgets">
          <GrowthTrendChart
            trendData={trendData}
            className="h-full"
          />
          <SubscriptionDistributionChart planDistribution={stats.planDistribution} className="h-full" />
          <SiteStatusChart statusDistribution={stats.statusDistribution} className="h-full" />
        </ItemGroup>
      </OverviewSection>

      <OverviewSection
        id="actions"
        title="Quick Actions"
        description="Frequently used administrative tasks"
      >
        <AdminOverviewActions stats={sharedStats} />
      </OverviewSection>

      <OverviewSection
        id="activity"
        title="Recent Activity"
        description="Latest client registrations and support tickets"
      >
        <ItemGroup className="grid auto-rows-[minmax(0,1fr)] gap-4 lg:grid-cols-2" aria-label="Recent activity">
          <AdminRecentClients clients={stats.recentClients} className="h-full" />
          <AdminRecentTickets tickets={stats.recentTickets} className="h-full" />
        </ItemGroup>
      </OverviewSection>
    </div>
  )
}

interface OverviewSectionProps {
  id: string
  title: string
  description: string
  children: React.ReactNode
}

function OverviewSection({ id, title, description, children }: OverviewSectionProps): React.JSX.Element {
  return (
    <section aria-labelledby={`${id}-heading`} className="space-y-4">
      <div className="space-y-1">
        <h2 id={`${id}-heading`} className="text-lg font-semibold">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  )
}
