import { AlertTriangle, CreditCard, DollarSign, XCircle } from 'lucide-react'
import type { Json } from '@/lib/types/database.types'
import { getFailedPayments, getPaymentStats } from '../api/queries'
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

function formatCurrency(amount: number, currency: string = 'CAD'): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100)
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getErrorMessage(lastError: Json | null): string {
  if (!lastError || typeof lastError !== 'object' || Array.isArray(lastError)) {
    return 'Unknown error'
  }
  const message = (lastError as Record<string, unknown>)['message']
  return typeof message === 'string' ? message : 'Payment failed'
}

export async function FailedPaymentsDashboard(): Promise<React.JSX.Element> {
  const [failedPayments, stats] = await Promise.all([
    getFailedPayments(),
    getPaymentStats(),
  ])

  const hasFailedPayments = failedPayments.length > 0

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Item variant="outline">
          <ItemMedia variant="icon">
            <DollarSign aria-hidden="true" />
          </ItemMedia>
          <ItemHeader>
            <ItemTitle>Total Payments</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <div className="text-2xl font-bold">{stats.totalPayments}</div>
            <ItemDescription>All payment attempts</ItemDescription>
          </ItemContent>
        </Item>

        <Item variant="outline">
          <ItemMedia variant="icon" className="text-green-600">
            <CreditCard aria-hidden="true" />
          </ItemMedia>
          <ItemHeader>
            <ItemTitle>Succeeded</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <div className="text-2xl font-bold">{stats.succeededPayments}</div>
            <ItemDescription>
              {formatCurrency(stats.totalProcessed)}
            </ItemDescription>
          </ItemContent>
        </Item>

        <Item variant="outline">
          <ItemMedia variant="icon" className="text-destructive">
            <XCircle aria-hidden="true" />
          </ItemMedia>
          <ItemHeader>
            <ItemTitle>Failed</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <div className="text-2xl font-bold">{stats.failedPayments}</div>
            <ItemDescription>
              {formatCurrency(stats.totalFailed)} at risk
            </ItemDescription>
          </ItemContent>
        </Item>

        <Item variant="outline">
          <ItemMedia variant="icon" className="text-yellow-600">
            <AlertTriangle aria-hidden="true" />
          </ItemMedia>
          <ItemHeader>
            <ItemTitle>Processing</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <div className="text-2xl font-bold">{stats.processingPayments}</div>
            <ItemDescription>In progress</ItemDescription>
          </ItemContent>
        </Item>
      </div>

      {/* Alert Summary */}
      {hasFailedPayments && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription>
            {failedPayments.length} failed payment{failedPayments.length > 1 ? 's' : ''} require
            immediate attention. Contact customers to update payment methods and recover revenue.
          </AlertDescription>
        </Alert>
      )}

      {/* Failed Payments Table */}
      <Item variant="outline">
        <ItemHeader>
          <ItemTitle>Failed Payments</ItemTitle>
          <ItemDescription>Payment attempts that require customer action</ItemDescription>
        </ItemHeader>
        <ItemContent>
          {!hasFailedPayments ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CreditCard />
                </EmptyMedia>
                <EmptyTitle>No failed payments</EmptyTitle>
                <EmptyDescription>
                  All payment attempts are successful. Great work!
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent />
            </Empty>
          ) : (
            <ScrollArea className="rounded-md border">
              <Table className="min-w-[1000px]">
                <caption className="sr-only">
                  List of failed payment attempts requiring customer action
                </caption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Customer</TableHead>
                    <TableHead scope="col">Invoice</TableHead>
                    <TableHead scope="col">Amount</TableHead>
                    <TableHead scope="col">Plan</TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col">Error</TableHead>
                    <TableHead scope="col">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {failedPayments.map((payment) => {
                    const profile = payment.profile
                    const invoice = payment.invoice
                    const subscription = payment.subscription
                    const plan = subscription?.plan

                    return (
                      <TableRow key={payment.id}>
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
                          {invoice?.invoice_number ? (
                            <div className="flex flex-col">
                              <span className="font-mono text-xs">
                                {invoice.invoice_number}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Due: {formatDate(invoice.due_date)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">
                            {formatCurrency(payment.amount, payment.currency)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {plan?.name ? (
                            <Badge variant="outline">{plan.name}</Badge>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">
                            {payment.status === 'requires_payment_method'
                              ? 'Payment Method Required'
                              : payment.cancellation_reason || 'Canceled'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate text-xs text-muted-foreground">
                            {getErrorMessage(payment.last_payment_error)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(payment.created_at)}
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
