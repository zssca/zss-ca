import { AlertTriangle, Bell, CheckCircle2, XCircle } from 'lucide-react'
import { getUnresolvedAlerts, getBillingAlertStats } from '../api/queries'
import { Item, ItemContent, ItemDescription, ItemHeader, ItemTitle, ItemMedia } from '@/components/ui/item'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

function formatCurrency(amount: number | null, currency: string | null = 'CAD'): string {
  if (amount === null) return 'N/A'
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: (currency || 'CAD').toUpperCase(),
  }).format(amount / 100)
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getSeverityVariant(severity: string): 'default' | 'secondary' | 'destructive' {
  switch (severity) {
    case 'critical':
    case 'high':
      return 'destructive'
    case 'medium':
      return 'default'
    case 'low':
      return 'secondary'
    default:
      return 'secondary'
  }
}

function getAlertTypeLabel(alertType: string): string {
  switch (alertType) {
    case 'payment_failed':
      return 'Payment Failed'
    case 'card_expiring':
      return 'Card Expiring'
    case 'refund_issued':
      return 'Refund Issued'
    case 'subscription_canceled':
      return 'Subscription Canceled'
    case 'trial_ending':
      return 'Trial Ending'
    default:
      return alertType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }
}

export async function BillingAlertsDisplay(): Promise<React.JSX.Element> {
  const [alerts, stats] = await Promise.all([
    getUnresolvedAlerts(),
    getBillingAlertStats(),
  ])

  const hasAlerts = alerts.length > 0
  const criticalCount = stats.criticalAlerts + stats.highAlerts

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Item variant="outline">
          <ItemMedia variant="icon">
            <Bell aria-hidden="true" />
          </ItemMedia>
          <ItemHeader>
            <ItemTitle>Total Alerts</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <div className="text-2xl font-bold">{stats.totalAlerts}</div>
            <ItemDescription>{stats.unresolvedAlerts} unresolved</ItemDescription>
          </ItemContent>
        </Item>

        <Item variant="outline">
          <ItemMedia variant="icon" className="text-destructive">
            <AlertTriangle aria-hidden="true" />
          </ItemMedia>
          <ItemHeader>
            <ItemTitle>Critical</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <div className="text-2xl font-bold">{stats.criticalAlerts}</div>
            <ItemDescription>Requires immediate action</ItemDescription>
          </ItemContent>
        </Item>

        <Item variant="outline">
          <ItemMedia variant="icon" className="text-yellow-600">
            <XCircle aria-hidden="true" />
          </ItemMedia>
          <ItemHeader>
            <ItemTitle>Payment Failed</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <div className="text-2xl font-bold">{stats.paymentFailedAlerts}</div>
            <ItemDescription>Needs follow-up</ItemDescription>
          </ItemContent>
        </Item>

        <Item variant="outline">
          <ItemMedia variant="icon" className="text-blue-600">
            <CheckCircle2 aria-hidden="true" />
          </ItemMedia>
          <ItemHeader>
            <ItemTitle>Card Expiring</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <div className="text-2xl font-bold">{stats.cardExpiringAlerts}</div>
            <ItemDescription>Update required</ItemDescription>
          </ItemContent>
        </Item>
      </div>

      {/* Critical Alerts Summary */}
      {criticalCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Critical Alerts Detected</AlertTitle>
          <AlertDescription>
            {criticalCount} critical billing alert{criticalCount > 1 ? 's' : ''} require immediate
            attention. Review and resolve these issues to prevent revenue loss.
          </AlertDescription>
        </Alert>
      )}

      {/* Alerts Table */}
      <Item variant="outline">
        <ItemHeader>
          <ItemTitle>Unresolved Alerts</ItemTitle>
          <ItemDescription>Billing issues requiring attention</ItemDescription>
        </ItemHeader>
        <ItemContent>
          {!hasAlerts ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CheckCircle2 />
                </EmptyMedia>
                <EmptyTitle>No unresolved alerts</EmptyTitle>
                <EmptyDescription>
                  All billing alerts have been resolved. Keep up the great work!
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent />
            </Empty>
          ) : (
            <ScrollArea className="rounded-md border">
              <Table className="min-w-[1000px]">
                <caption className="sr-only">
                  List of unresolved billing alerts with severity and customer details
                </caption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Severity</TableHead>
                    <TableHead scope="col">Type</TableHead>
                    <TableHead scope="col">Customer</TableHead>
                    <TableHead scope="col">Message</TableHead>
                    <TableHead scope="col">Amount</TableHead>
                    <TableHead scope="col">Invoice</TableHead>
                    <TableHead scope="col">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => {
                    const profile = alert.profile
                    const invoice = alert.invoice

                    return (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <Badge variant={getSeverityVariant(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {getAlertTypeLabel(alert.alert_type)}
                            </span>
                          </div>
                        </TableCell>
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
                          <div className="max-w-[300px] text-sm">
                            {alert.message}
                          </div>
                        </TableCell>
                        <TableCell>
                          {invoice ? (
                            <span className="font-semibold">
                              {formatCurrency(invoice.total ?? 0)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {invoice ? (
                            <div className="flex flex-col">
                              <span className="font-mono text-xs">
                                {invoice.invoice_number || 'Draft'}
                              </span>
                              <Badge
                                variant={
                                  invoice.status === 'paid'
                                    ? 'default'
                                    : invoice.status === 'open'
                                      ? 'secondary'
                                      : 'destructive'
                                }
                                className="mt-1 w-fit"
                              >
                                {invoice.status}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(alert.created_at)}
                          </div>
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
