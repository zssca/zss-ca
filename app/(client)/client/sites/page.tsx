import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SitesListFeature } from '@/features/client/sites'
export const metadata: Metadata = {
  title: 'My Sites',
  description: 'Manage your websites and view deployment status',
  robots: {
    index: false,
    follow: false,
  },
}
export const dynamic = 'force-dynamic'
export default async function ClientSitesPage() {
  return <Suspense fallback={null}><SitesListFeature /></Suspense>
}
