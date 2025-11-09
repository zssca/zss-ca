import {
  BarChart3,
  TrendingUp,
  Users,
  Globe,
  TicketCheck,
  DollarSign,
  UserMinus,
} from 'lucide-react'
import { getAnalyticsData } from '../api/queries'
import { getAdminDashboardStats } from '@/features/admin/dashboard/api/queries'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { PlanDistributionChart } from './plan-distribution-chart'
import { StatusDistributionChart } from './status-distribution-chart'
import { RevenueDashboard } from './revenue-dashboard'
import { ChurnDashboard } from './churn-dashboard'

export async function AnalyticsPageFeature(): Promise<React.JSX.Element> {
  const _data = await getAnalyticsData()
  const stats = await getAdminDashboardStats()

  // Prepare data for charts
  const planDistributionData = Object.entries(stats.planDistribution).map(([name, count]) => ({
    name,
    value: count,
  }))

  const statusDistributionData = Object.entries(stats.statusDistribution).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: count,
  }))

  // Calculate growth rates and percentages
  const subscriptionRate = stats.totalClients > 0
    ? (stats.activeSubscriptions / stats.totalClients) * 100
    : 0

  const liveRate = stats.totalClients > 0
    ? (stats.liveSites / stats.totalClients) * 100
    : 0

  const ticketRate = stats.totalClients > 0
    ? (stats.openTickets / stats.totalClients) * 100
    : 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Item variant="outline">
          <ItemMedia variant="icon">
            <Users aria-hidden="true" />
          </ItemMedia>
          <ItemHeader>
            <ItemTitle>Total Clients</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <ItemDescription>Active client accounts</ItemDescription>
          </ItemContent>
        </Item>

        <Item variant="outline">
          <ItemMedia variant="icon">
            <TrendingUp aria-hidden="true" />
          </ItemMedia>
          <ItemHeader>
            <ItemTitle>Subscriptions</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <ItemDescription>{subscriptionRate.toFixed(1)}% conversion rate</ItemDescription>
          </ItemContent>
        </Item>

        <Item variant="outline">
          <ItemMedia variant="icon">
            <Globe aria-hidden="true" />
          </ItemMedia>
          <ItemHeader>
            <ItemTitle>Live Sites</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <div className="text-2xl font-bold">{stats.liveSites}</div>
            <ItemDescription>{liveRate.toFixed(1)}% deployment rate</ItemDescription>
          </ItemContent>
        </Item>

        <Item variant="outline">
          <ItemMedia variant="icon">
            <TicketCheck aria-hidden="true" />
          </ItemMedia>
          <ItemHeader>
            <ItemTitle>Open Tickets</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <div className="text-2xl font-bold">{stats.openTickets}</div>
            <ItemDescription>{ticketRate.toFixed(1)}% support volume</ItemDescription>
          </ItemContent>
        </Item>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">
            <DollarSign className="mr-2 size-4" aria-hidden="true" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="retention">
            <UserMinus className="mr-2 size-4" aria-hidden="true" />
            Retention & Churn
          </TabsTrigger>
          <TabsTrigger value="plans">
            <BarChart3 className="mr-2 size-4" aria-hidden="true" />
            Plan Distribution
          </TabsTrigger>
          <TabsTrigger value="sites">
            <Globe className="mr-2 size-4" aria-hidden="true" />
            Site Status
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <TrendingUp className="mr-2 size-4" aria-hidden="true" />
            Key Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <RevenueDashboard />
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <ChurnDashboard />
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <Item variant="outline">
            <ItemHeader>
              <ItemTitle>Subscription Plans Distribution</ItemTitle>
              <ItemDescription>Active subscriptions by plan type</ItemDescription>
            </ItemHeader>
            <ItemContent>
              <PlanDistributionChart data={planDistributionData} />
            </ItemContent>
          </Item>
        </TabsContent>

        <TabsContent value="sites" className="space-y-4">
          <Item variant="outline">
            <ItemHeader>
              <ItemTitle>Site Status Distribution</ItemTitle>
              <ItemDescription>Client sites by current status</ItemDescription>
            </ItemHeader>
            <ItemContent>
              <StatusDistributionChart data={statusDistributionData} />
            </ItemContent>
          </Item>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Item variant="outline">
              <ItemHeader>
                <ItemTitle>Subscription Rate</ItemTitle>
                <ItemDescription>Percentage of clients with active subscriptions</ItemDescription>
              </ItemHeader>
              <ItemContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{subscriptionRate.toFixed(1)}%</div>
                  <Progress value={subscriptionRate} aria-label="Subscription rate" />
                  <ItemDescription>
                    {stats.activeSubscriptions} of {stats.totalClients} clients
                  </ItemDescription>
                </div>
              </ItemContent>
            </Item>

            <Item variant="outline">
              <ItemHeader>
                <ItemTitle>Deployment Rate</ItemTitle>
                <ItemDescription>Percentage of clients with live sites</ItemDescription>
              </ItemHeader>
              <ItemContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{liveRate.toFixed(1)}%</div>
                  <Progress value={liveRate} aria-label="Deployment rate" />
                  <ItemDescription>
                    {stats.liveSites} live sites from {stats.totalClients} clients
                  </ItemDescription>
                </div>
              </ItemContent>
            </Item>

            <Item variant="outline">
              <ItemHeader>
                <ItemTitle>Support Volume</ItemTitle>
                <ItemDescription>Open tickets relative to client base</ItemDescription>
              </ItemHeader>
              <ItemContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{ticketRate.toFixed(1)}%</div>
                  <Progress value={ticketRate} aria-label="Support ticket rate" />
                  <ItemDescription>
                    {stats.openTickets} open tickets for {stats.totalClients} clients
                  </ItemDescription>
                </div>
              </ItemContent>
            </Item>

            <Item variant="outline">
              <ItemHeader>
                <ItemTitle>Average Sites per Client</ItemTitle>
                <ItemDescription>Site deployment ratio</ItemDescription>
              </ItemHeader>
              <ItemContent>
                <div className="text-2xl font-bold">
                  {stats.totalClients > 0
                    ? (Object.values(stats.statusDistribution).reduce((a, b) => a + b, 0) / stats.totalClients).toFixed(2)
                    : '0.00'}
                </div>
                <ItemDescription>
                  Sites per active client
                </ItemDescription>
              </ItemContent>
            </Item>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
