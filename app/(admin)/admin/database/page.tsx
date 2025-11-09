import { Metadata } from 'next'
import { PageHeader } from '@/components/layout/dashboard'
import { DatabaseMonitoringFeature } from '@/features/admin/database/database-monitoring-feature'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Database Monitoring | Admin',
  description: 'Monitor database health, performance, and security',
}
export default function DatabaseMonitoringPage() {
  return <><PageHeader pageTitle="Database Monitoring" pageDescription="Real-time database health, performance metrics, and security analysis" /><DatabaseMonitoringFeature /></>
}
