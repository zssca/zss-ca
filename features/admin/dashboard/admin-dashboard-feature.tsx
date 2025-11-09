import { getAdminDashboardStats, getGrowthTrend } from './api'
import { AdminOverview } from './components'
import { getDatabaseHealth, getRLSCoverage } from '../database/api'

export async function AdminDashboardFeature() {
  // Fetch dashboard stats, growth trend data, and database monitoring data in parallel
  const [stats, trendData, databaseHealth, rlsCoverage] = await Promise.all([
    getAdminDashboardStats(),
    getGrowthTrend(),
    getDatabaseHealth().catch(() => []),
    getRLSCoverage().catch(() => []),
  ])

  return (
    <AdminOverview
      stats={stats}
      trendData={trendData}
      databaseHealth={databaseHealth}
      rlsCoverage={rlsCoverage}
    />
  )
}
