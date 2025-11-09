import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AnalyticsPageFeature } from '@/features/admin/analytics'
export const metadata: Metadata = {
  title: 'Analytics',
  description: 'Platform analytics and metrics',
  robots: {
    index: false,
    follow: false,
  },
}
export const dynamic = 'force-dynamic'
export default async function AdminAnalyticsPage() {
  return <Suspense fallback={null}><AnalyticsPageFeature /></Suspense>
}
