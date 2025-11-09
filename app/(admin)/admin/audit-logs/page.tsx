import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AdminAuditLogsFeature } from '@/features/admin/audit-logs'
export const metadata: Metadata = {
  title: 'Audit Logs',
  description: 'View system audit logs and activity history',
  robots: {
    index: false,
    follow: false,
  },
}
export const dynamic = 'force-dynamic'
export default async function AdminAuditLogsPage() {
  return <Suspense fallback={null}><AdminAuditLogsFeature /></Suspense>
}
