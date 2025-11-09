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
import { Progress } from '@/components/ui/progress'
import { Database, AlertTriangle, Clock } from 'lucide-react'
import type { TableStats } from '../api'

interface TableStatsCardProps {
  data: TableStats[]
}

function formatTimeAgo(date: string | null): string {
  if (!date) return 'Never'

  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  if (diffMinutes > 0) return `${diffMinutes}m ago`
  return 'Just now'
}

function getDeadRowBadgeVariant(percent: number): 'default' | 'secondary' | 'destructive' {
  if (percent <= 5) return 'default'
  if (percent <= 15) return 'secondary'
  return 'destructive'
}

export function TableStatsCard({ data }: TableStatsCardProps) {
  const tablesNeedingVacuum = data.filter((table) => table.dead_row_percent > 15)
  const totalRows = data.reduce((sum, table) => sum + table.live_rows, 0)
  const totalDeadRows = data.reduce((sum, table) => sum + table.dead_rows, 0)

  const stats = {
    totalTables: data.length,
    totalRows: totalRows,
    totalDeadRows: totalDeadRows,
    avgDeadPercent: totalRows > 0 ? Math.round((totalDeadRows / totalRows) * 100) : 0,
    needsVacuum: tablesNeedingVacuum.length,
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Table Statistics</CardTitle>
          </div>
          <Badge variant="outline">{stats.totalTables} tables</Badge>
        </div>
        <CardDescription>
          Table sizes, row counts, and maintenance status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid gap-2 sm:grid-cols-5">
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Total Rows</div>
            <div className="text-2xl font-semibold">
              {stats.totalRows.toLocaleString()}
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Dead Rows</div>
            <div className="text-2xl font-semibold">
              {stats.totalDeadRows.toLocaleString()}
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Avg Dead %</div>
            <div className="text-2xl font-semibold">{stats.avgDeadPercent}%</div>
          </div>
          <div className="rounded-lg border bg-yellow-50 p-3 dark:bg-yellow-950">
            <div className="text-xs text-muted-foreground">Need Vacuum</div>
            <div className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
              {stats.needsVacuum}
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Tables</div>
            <div className="text-2xl font-semibold">{stats.totalTables}</div>
          </div>
        </div>

        {/* Vacuum Alert */}
        {tablesNeedingVacuum.length > 0 && (
          <Alert variant="destructive" className="border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Maintenance Recommended</AlertTitle>
            <AlertDescription>
              {tablesNeedingVacuum.length} table{tablesNeedingVacuum.length !== 1 ? 's' : ''}
              {' '}with high dead row percentage (&gt;15%):{' '}
              {tablesNeedingVacuum.slice(0, 3).map((t) => t.tablename).join(', ')}
              {tablesNeedingVacuum.length > 3 && ` and ${tablesNeedingVacuum.length - 3} more`}
            </AlertDescription>
          </Alert>
        )}

        {/* Table Details */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table</TableHead>
                <TableHead className="text-right">Live Rows</TableHead>
                <TableHead className="text-right">Dead Rows</TableHead>
                <TableHead>Dead %</TableHead>
                <TableHead>Total Size</TableHead>
                <TableHead>Last Vacuum</TableHead>
                <TableHead>Last Analyze</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 10).map((table) => (
                <TableRow key={table.tablename}>
                  <TableCell className="font-mono text-sm">{table.tablename}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {table.live_rows.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {table.dead_rows.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={Math.min(table.dead_row_percent, 100)}
                        className="h-1.5 w-12"
                      />
                      <Badge variant={getDeadRowBadgeVariant(table.dead_row_percent)}>
                        {table.dead_row_percent.toFixed(1)}%
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <div className="font-semibold">{table.total_size}</div>
                      <div className="text-xs text-muted-foreground">
                        Table: {table.table_size}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(table.last_vacuum || table.last_autovacuum)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(table.last_analyze || table.last_autoanalyze)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {data.length > 10 && (
          <div className="text-center text-sm text-muted-foreground">
            Showing 10 of {data.length} tables (sorted by row count)
          </div>
        )}
      </CardContent>
    </Card>
  )
}
