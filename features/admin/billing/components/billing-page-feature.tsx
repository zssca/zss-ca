import { Suspense } from 'react'
import { CreditCard, DollarSign, TrendingUp, Users } from 'lucide-react'
import { getBillingData } from '../api/queries'
import { createClient } from '@/lib/supabase/server'
import { Item, ItemContent, ItemDescription, ItemHeader, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InvoicesTable } from './invoices-table'
import { FailedPaymentsDashboard } from './failed-payments-dashboard'
import { BillingAlertsDisplay } from './billing-alerts-display'

async function SubscriptionsOverview() {
  const _data = await getBillingData()
  const supabase = await createClient()

  // Fetch subscription data with plan and profile information
  const { data: subscriptions } = await supabase
    .from('subscription')
    .select(`
      id,
      status,
      current_period_start,
      current_period_end,
      plan:plan_id (
        id,
        name,
        slug
      ),
      profile:profile_id (
        id,
        contact_name,
        contact_email,
        company_name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  const subs = subscriptions || []

  // Calculate billing metrics
  const activeSubscriptions = subs.filter((s) => s.status === 'active').length
  const pastDueSubscriptions = subs.filter((s) => s.status === 'past_due').length
  const canceledSubscriptions = subs.filter((s) => s.status === 'canceled').length
  const totalSubscriptions = subs.length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Item variant="outline">
          <ItemMedia variant="icon">
            <Users aria-hidden="true" />
          </ItemMedia>
          <ItemHeader>
            <ItemTitle>Total Subscriptions</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <div className="text-2xl font-bold">{totalSubscriptions}</div>
            <ItemDescription>All client subscriptions</ItemDescription>
          </ItemContent>
        </Item>

        <Item variant="outline">
          <ItemMedia variant="icon">
            <TrendingUp aria-hidden="true" />
          </ItemMedia>
          <ItemHeader>
            <ItemTitle>Active</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
            <ItemDescription>Currently paying clients</ItemDescription>
          </ItemContent>
        </Item>

        <Item variant="outline">
          <ItemMedia variant="icon">
            <CreditCard aria-hidden="true" />
          </ItemMedia>
          <ItemHeader>
            <ItemTitle>Past Due</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <div className="text-2xl font-bold">{pastDueSubscriptions}</div>
            <ItemDescription>Payment issues</ItemDescription>
          </ItemContent>
        </Item>

        <Item variant="outline">
          <ItemMedia variant="icon">
            <DollarSign aria-hidden="true" />
          </ItemMedia>
          <ItemHeader>
            <ItemTitle>Canceled</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <div className="text-2xl font-bold">{canceledSubscriptions}</div>
            <ItemDescription>No longer active</ItemDescription>
          </ItemContent>
        </Item>
      </div>

      <Item variant="outline">
        <ItemHeader>
          <ItemTitle>Active Subscriptions</ItemTitle>
          <ItemDescription>Manage client billing and subscription details</ItemDescription>
        </ItemHeader>
        <ItemContent>
          {subs.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CreditCard />
                </EmptyMedia>
                <EmptyTitle>No subscriptions yet</EmptyTitle>
                <EmptyDescription>
                  Subscriptions will appear here once clients sign up for a plan.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent />
            </Empty>
          ) : (
            <ScrollArea className="rounded-md border">
              <Table className="min-w-[800px]">
                <caption className="sr-only">
                  List of client subscriptions with plan details, status, and billing periods
                </caption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Client</TableHead>
                    <TableHead scope="col">Plan</TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col">Current Period</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subs.map((subscription) => {
                    const profile = subscription.profile as { contact_name?: string | null; contact_email?: string | null; company_name?: string | null } | null
                    const plan = subscription.plan as { name?: string } | null

                    return (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {profile?.contact_name || profile?.company_name || 'Unknown'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {profile?.contact_email || 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{plan?.name || 'Unknown'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              subscription.status === 'active'
                                ? 'default'
                                : subscription.status === 'past_due'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {subscription.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {subscription.current_period_start && subscription.current_period_end ? (
                            <div className="flex flex-col text-xs">
                              <span>
                                {new Date(subscription.current_period_start).toLocaleDateString()}
                              </span>
                              <span className="text-muted-foreground">
                                to {new Date(subscription.current_period_end).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
        </ItemContent>
      </Item>
    </div>
  )
}

export async function BillingPageFeature(): Promise<React.JSX.Element> {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="invoices">Invoices</TabsTrigger>
        <TabsTrigger value="failed-payments">Failed Payments</TabsTrigger>
        <TabsTrigger value="alerts">Alerts</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <Suspense fallback={<div>Loading subscriptions...</div>}>
          <SubscriptionsOverview />
        </Suspense>
      </TabsContent>

      <TabsContent value="invoices" className="space-y-6">
        <Suspense fallback={<div>Loading invoices...</div>}>
          <InvoicesTable />
        </Suspense>
      </TabsContent>

      <TabsContent value="failed-payments" className="space-y-6">
        <Suspense fallback={<div>Loading failed payments...</div>}>
          <FailedPaymentsDashboard />
        </Suspense>
      </TabsContent>

      <TabsContent value="alerts" className="space-y-6">
        <Suspense fallback={<div>Loading alerts...</div>}>
          <BillingAlertsDisplay />
        </Suspense>
      </TabsContent>
    </Tabs>
  )
}
