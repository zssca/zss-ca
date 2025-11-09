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
import { Key, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import type { IndexUsage } from '../api'

interface IndexUsageCardProps {
  data: IndexUsage[]
}

function getUsageBadgeVariant(category: IndexUsage['usage_category']): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (category) {
    case 'HIGH USAGE':
      return 'default'
    case 'MODERATE':
      return 'secondary'
    case 'LOW USAGE':
      return 'outline'
    case 'UNUSED':
      return 'destructive'
    default:
      return 'outline'
  }
}

function getUsageIcon(category: IndexUsage['usage_category']) {
  switch (category) {
    case 'HIGH USAGE':
      return <TrendingUp className="h-3 w-3" />
    case 'MODERATE':
      return <TrendingUp className="h-3 w-3" />
    case 'LOW USAGE':
      return <TrendingDown className="h-3 w-3" />
    case 'UNUSED':
      return <AlertTriangle className="h-3 w-3" />
    default:
      return null
  }
}

export function IndexUsageCard({ data }: IndexUsageCardProps) {
  const unusedIndexes = data.filter((idx) => idx.usage_category === 'UNUSED')
  const lowUsageIndexes = data.filter((idx) => idx.usage_category === 'LOW USAGE')

  const stats = {
    total: data.length,
    unused: unusedIndexes.length,
    lowUsage: lowUsageIndexes.length,
    moderate: data.filter((idx) => idx.usage_category === 'MODERATE').length,
    high: data.filter((idx) => idx.usage_category === 'HIGH USAGE').length,
  }

  const maxScans = Math.max(...data.map((idx) => idx.scans), 1)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Index Usage Analysis</CardTitle>
          </div>
          <Badge variant="outline">{stats.total} indexes</Badge>
        </div>
        <CardDescription>
          Monitor index performance and identify unused or inefficient indexes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid gap-2 sm:grid-cols-4">
          <div className="rounded-lg border bg-green-50 p-3 dark:bg-green-950">
            <div className="text-xs text-muted-foreground">High Usage</div>
            <div className="text-2xl font-semibold text-green-600 dark:text-green-400">
              {stats.high}
            </div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">Moderate</div>
            <div className="text-2xl font-semibold">{stats.moderate}</div>
          </div>
          <div className="rounded-lg border bg-yellow-50 p-3 dark:bg-yellow-950">
            <div className="text-xs text-muted-foreground">Low Usage</div>
            <div className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
              {stats.lowUsage}
            </div>
          </div>
          <div className="rounded-lg border bg-red-50 p-3 dark:bg-red-950">
            <div className="text-xs text-muted-foreground">Unused</div>
            <div className="text-2xl font-semibold text-red-600 dark:text-red-400">
              {stats.unused}
            </div>
          </div>
        </div>

        {/* Unused Indexes Alert */}
        {unusedIndexes.length > 0 && (
          <Alert variant="destructive" className="border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Performance Opportunity</AlertTitle>
            <AlertDescription>
              {unusedIndexes.length} unused index{unusedIndexes.length !== 1 ? 'es' : ''} found.
              Consider removing: {unusedIndexes.slice(0, 3).map((idx) => idx.indexname).join(', ')}
              {unusedIndexes.length > 3 && ` and ${unusedIndexes.length - 3} more`}
            </AlertDescription>
          </Alert>
        )}

        {/* Index Details Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Index Name</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Scans</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead className="w-[150px]">Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 10).map((index) => (
                <TableRow key={`${index.tablename}-${index.indexname}`}>
                  <TableCell className="font-mono text-sm">{index.indexname}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {index.tablename}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{index.scans.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{index.index_size}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getUsageBadgeVariant(index.usage_category)}
                      className="flex w-fit items-center gap-1"
                    >
                      {getUsageIcon(index.usage_category)}
                      {index.usage_category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Progress
                        value={(index.scans / maxScans) * 100}
                        className="h-1.5"
                      />
                      <div className="text-xs text-muted-foreground">
                        {index.tuples_read.toLocaleString()} reads
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {data.length > 10 && (
          <div className="text-center text-sm text-muted-foreground">
            Showing 10 of {data.length} indexes (sorted by usage)
          </div>
        )}
      </CardContent>
    </Card>
  )
}
