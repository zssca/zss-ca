'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react'
import type { RLSCoverage } from '../api'

interface RLSCoverageCardProps {
  data: RLSCoverage[]
}

function getStatusIcon(status: RLSCoverage['status']) {
  switch (status) {
    case 'COVERED':
      return <ShieldCheck className="h-4 w-4 text-green-500" />
    case 'FEW POLICIES':
      return <ShieldAlert className="h-4 w-4 text-yellow-500" />
    case 'NO POLICIES':
      return <ShieldX className="h-4 w-4 text-red-500" />
    case 'RLS DISABLED':
      return <ShieldX className="h-4 w-4 text-red-500" />
    default:
      return <Shield className="h-4 w-4 text-muted-foreground" />
  }
}

function getStatusBadgeVariant(status: RLSCoverage['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'COVERED':
      return 'outline'
    case 'FEW POLICIES':
      return 'secondary'
    case 'NO POLICIES':
      return 'destructive'
    case 'RLS DISABLED':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export function RLSCoverageCard({ data }: RLSCoverageCardProps) {
  const vulnerableTables = data.filter(
    (table) => table.status === 'RLS DISABLED' || table.status === 'NO POLICIES'
  )

  const stats = {
    total: data.length,
    secured: data.filter((t) => t.status === 'COVERED').length,
    partial: data.filter((t) => t.status === 'FEW POLICIES').length,
    vulnerable: vulnerableTables.length,
  }

  const securityScore = Math.round((stats.secured / stats.total) * 100)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle>RLS Coverage</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={securityScore >= 80 ? 'outline' : securityScore >= 60 ? 'secondary' : 'destructive'}
              className={
                securityScore >= 80
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : securityScore >= 60
                    ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                    : undefined
              }
            >
              {securityScore}% Secured
            </Badge>
          </div>
        </div>
        <CardDescription>
          Row Level Security policy coverage across all tables
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid gap-2 sm:grid-cols-4">
          <div className="rounded-lg border bg-green-50 p-3 dark:bg-green-950">
            <div className="text-xs text-muted-foreground">Secured</div>
            <div className="text-2xl font-semibold text-green-600 dark:text-green-400">
              {stats.secured}
            </div>
          </div>
          <div className="rounded-lg border bg-yellow-50 p-3 dark:bg-yellow-950">
            <div className="text-xs text-muted-foreground">Partial</div>
            <div className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
              {stats.partial}
            </div>
          </div>
          <div className="rounded-lg border bg-red-50 p-3 dark:bg-red-950">
            <div className="text-xs text-muted-foreground">Vulnerable</div>
            <div className="text-2xl font-semibold text-red-600 dark:text-red-400">
              {stats.vulnerable}
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-2xl font-semibold">{stats.total}</div>
          </div>
        </div>

        {/* Vulnerable Tables Alert */}
        {vulnerableTables.length > 0 && (
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Security Alert</AlertTitle>
            <AlertDescription>
              {vulnerableTables.length} table{vulnerableTables.length !== 1 ? 's' : ''} without
              proper RLS protection: {vulnerableTables.map((t) => t.tablename).join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {/* Table Details */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Policies</TableHead>
                <TableHead>Policy Names</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((table) => (
                <TableRow key={table.tablename}>
                  <TableCell className="font-mono text-sm">{table.tablename}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(table.status)}
                      <Badge variant={getStatusBadgeVariant(table.status)}>
                        {table.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">{table.policy_count}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {table.policies?.join(', ') || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
