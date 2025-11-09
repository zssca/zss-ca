import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Database, Shield, AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { ROUTES } from '@/lib/constants'
import type { DatabaseHealth, RLSCoverage } from '../api'

interface DatabaseSummaryWidgetProps {
  healthData: DatabaseHealth[]
  rlsData: RLSCoverage[]
}

export function DatabaseSummaryWidget({ healthData, rlsData }: DatabaseSummaryWidgetProps) {
  // Calculate key metrics
  const tableCount = healthData.find((d) => d.category === 'Tables')?.value || '0'
  const rlsEnabledCount = healthData.find((d) => d.category === 'RLS Enabled Tables')?.value || '0'
  const policyCount = healthData.find((d) => d.category === 'RLS Policies')?.value || '0'

  const vulnerableTables = rlsData.filter(
    (table) => table.status === 'RLS DISABLED' || table.status === 'NO POLICIES'
  ).length

  const securityScore = rlsData.length > 0
    ? Math.round((rlsData.filter((t) => t.status === 'COVERED').length / rlsData.length) * 100)
    : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Database Health</CardTitle>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href={ROUTES.ADMIN_DATABASE}>
              View Details
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Tables</p>
            <p className="text-2xl font-semibold">{tableCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">RLS Coverage</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-semibold">{securityScore}%</p>
              <Badge
                variant={securityScore >= 80 ? 'outline' : 'destructive'}
                className={
                  securityScore >= 80
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : undefined
                }
              >
                {rlsEnabledCount}/{tableCount}
              </Badge>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Policies</p>
            <p className="text-2xl font-semibold">{policyCount}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Security</p>
            <div className="flex items-center gap-2">
              {vulnerableTables > 0 ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <Badge
                    variant="outline"
                    className="border-yellow-200 bg-yellow-50 text-yellow-700"
                  >
                    {vulnerableTables} at risk
                  </Badge>
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 text-green-500" />
                  <Badge
                    variant="outline"
                    className="border-green-200 bg-green-50 text-green-700"
                  >
                    Secured
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
