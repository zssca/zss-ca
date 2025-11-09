import { Suspense } from 'react'
import {
  getDatabaseHealth,
  getRLSCoverage,
  getIndexUsage,
  getTableStats,
} from './api'
import {
  DatabaseHealthCard,
  RLSCoverageCard,
  IndexUsageCard,
  TableStatsCard,
} from './components'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

function LoadingState() {
  return (
    <div className="flex h-32 items-center justify-center">
      <Spinner />
    </div>
  )
}

async function DatabaseHealthSection() {
  const result = await getDatabaseHealth().catch((error) => {
    console.error('Failed to load database health:', error)
    return null
  })

  if (!result) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Failed to load database health</AlertTitle>
        <AlertDescription>
          Unable to fetch database health statistics. Please check your permissions.
        </AlertDescription>
      </Alert>
    )
  }

  return <DatabaseHealthCard data={result} />
}

async function RLSCoverageSection() {
  const result = await getRLSCoverage().catch((error) => {
    console.error('Failed to load RLS coverage:', error)
    return null
  })

  if (!result) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Failed to load RLS coverage</AlertTitle>
        <AlertDescription>
          Unable to fetch RLS coverage data. Please check your permissions.
        </AlertDescription>
      </Alert>
    )
  }

  return <RLSCoverageCard data={result} />
}

async function IndexUsageSection() {
  const result = await getIndexUsage().catch((error) => {
    console.error('Failed to load index usage:', error)
    return null
  })

  if (!result) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Failed to load index usage</AlertTitle>
        <AlertDescription>
          Unable to fetch index usage statistics. Please check your permissions.
        </AlertDescription>
      </Alert>
    )
  }

  return <IndexUsageCard data={result} />
}

async function TableStatsSection() {
  const result = await getTableStats().catch((error) => {
    console.error('Failed to load table stats:', error)
    return null
  })

  if (!result) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Failed to load table statistics</AlertTitle>
        <AlertDescription>
          Unable to fetch table statistics. Please check your permissions.
        </AlertDescription>
      </Alert>
    )
  }

  return <TableStatsCard data={result} />
}

export function DatabaseMonitoringFeature() {
  return (
    <div className="space-y-6">
      {/* Database Health Overview */}
      <Suspense fallback={<LoadingState />}>
        <DatabaseHealthSection />
      </Suspense>

      {/* RLS Coverage Analysis */}
      <Suspense fallback={<LoadingState />}>
        <RLSCoverageSection />
      </Suspense>

      {/* Index Usage Analysis */}
      <Suspense fallback={<LoadingState />}>
        <IndexUsageSection />
      </Suspense>

      {/* Table Statistics */}
      <Suspense fallback={<LoadingState />}>
        <TableStatsSection />
      </Suspense>
    </div>
  )
}
