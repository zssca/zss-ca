import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AdminDashboardFeature } from '@/features/admin/dashboard'
import { AdminOverviewSkeleton } from '@/features/admin/dashboard/components/admin-overview-skeleton'
export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Overview of your platform metrics and activities',
  robots: { index: false, follow: false },
}
export const dynamic = 'force-dynamic'
export default async function AdminDashboardPage() {
  return <Suspense fallback={<AdminOverviewSkeleton />}><AdminDashboardFeature /></Suspense>
}
