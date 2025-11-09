import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SitesPageFeature } from '@/features/admin/sites'
export const metadata: Metadata = {
  title: 'Sites',
  description: 'Manage all client websites and deployments',
  robots: {
    index: false,
    follow: false,
  },
}
export const dynamic = 'force-dynamic'
export default async function AdminSitesPage() {
  return <Suspense fallback={null}><SitesPageFeature /></Suspense>
}
