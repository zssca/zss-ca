import { Suspense } from 'react'
import type { Metadata } from 'next'
import { DashboardFeature } from '@/features/client/dashboard'
export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Overview of your sites and activities',
  robots: {
    index: false,
    follow: false,
  },
}
export const dynamic = 'force-dynamic'
export default async function ClientDashboardPage() {
  return <Suspense fallback={null}><DashboardFeature /></Suspense>
}
