import { FileText, Download, ExternalLink } from 'lucide-react'
import { getInvoices, getInvoiceStats } from '../api/queries'
import { Item, ItemContent, ItemDescription, ItemHeader, ItemTitle, ItemMedia } from '@/components/ui/item'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'paid':
      return 'default'
    case 'open':
      return 'secondary'
    case 'void':
    case 'uncollectible':
      return 'destructive'
    default:
      return 'outline'
  }
}

export async function InvoicesTable(): Promise<React.JSX.Element> {
  const [invoices, stats] = await Promise.all([
    getInvoices(),
    getInvoiceStats(),
  ])

  const hasInvoices = invoices.length > 0

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Item variant="outline">
          <ItemMedia variant="icon">
            <FileText aria-hidden="true" />
          </ItemMedia>
          <ItemHeader>
            <ItemTitle>Total Invoices</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
            <ItemDescription>All time</ItemDescription>
          </ItemContent>
        </Item>

        <Item variant="outline">
          <ItemMedia variant="icon" className="text-green-600">
            <FileText aria-hidden="true" />
          </ItemMedia>
          <ItemHeader>
            <ItemTitle>Paid</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <div className="text-2xl font-bold">{stats.paidInvoices}</div>
            <ItemDescription>
              {formatCurrency(stats.totalRevenue)} collected
            </ItemDescription>
          </ItemContent>
        </Item>

        <Item variant="outline">
          <ItemMedia variant="icon" className="text-yellow-600">
            <FileText aria-hidden="true" />
          </ItemMedia>
          <ItemHeader>
            <ItemTitle>Open</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <div className="text-2xl font-bold">{stats.openInvoices}</div>
            <ItemDescription>
              {formatCurrency(stats.outstandingAmount)} outstanding
            </ItemDescription>
          </ItemContent>
        </Item>

        <Item variant="outline">
          <ItemMedia variant="icon" className="text-destructive">
            <FileText aria-hidden="true" />
          </ItemMedia>
          <ItemHeader>
            <ItemTitle>Uncollectible</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <div className="text-2xl font-bold">{stats.uncollectibleInvoices}</div>
            <ItemDescription>Marked as lost</ItemDescription>
          </ItemContent>
        </Item>
      </div>

      {/* Invoices Table */}
      <Item variant="outline">
        <ItemHeader>
          <ItemTitle>All Invoices</ItemTitle>
          <ItemDescription>Complete invoice history with download links</ItemDescription>
        </ItemHeader>
        <ItemContent>
          {!hasInvoices ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText />
                </EmptyMedia>
                <EmptyTitle>No invoices yet</EmptyTitle>
                <EmptyDescription>
                  Invoices will appear here once customers make purchases.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent />
            </Empty>
          ) : (
            <ScrollArea className="rounded-md border">
              <Table className="min-w-[1200px]">
                <caption className="sr-only">
                  Complete list of invoices with customer details and payment status
                </caption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Invoice</TableHead>
                    <TableHead scope="col">Customer</TableHead>
                    <TableHead scope="col">Plan</TableHead>
                    <TableHead scope="col">Amount</TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col">Period</TableHead>
                    <TableHead scope="col">Paid Date</TableHead>
                    <TableHead scope="col">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => {
                    const profile = invoice.profile
                    const subscription = invoice.subscription
                    const plan = subscription?.plan

                    return (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-mono text-sm font-medium">
                              {invoice.invoice_number || 'Draft'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {invoice.stripe_invoice_id.substring(0, 20)}...
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
                          {plan?.name ? (
                            <Badge variant="outline">{plan.name}</Badge>
                          ) : (
                            <span className="text-muted-foreground">One-time</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold">
                              {formatCurrency(invoice.total, invoice.currency)}
                            </span>
                            {invoice.amount_remaining > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {formatCurrency(invoice.amount_remaining, invoice.currency)} due
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(invoice.status)}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {invoice.period_start && invoice.period_end ? (
                            <div className="flex flex-col text-xs">
                              <span>{formatDate(invoice.period_start)}</span>
                              <span className="text-muted-foreground">
                                to {formatDate(invoice.period_end)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(invoice.paid_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {invoice.invoice_pdf_url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <a
                                  href={invoice.invoice_pdf_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1"
                                >
                                  <Download className="h-3 w-3" aria-hidden="true" />
                                  <span className="sr-only">Download PDF</span>
                                </a>
                              </Button>
                            )}
                            {invoice.hosted_invoice_url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <a
                                  href={invoice.hosted_invoice_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1"
                                >
                                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                                  <span className="sr-only">View invoice</span>
                                </a>
                              </Button>
                            )}
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
