import { Suspense } from 'react'
import type { Metadata } from 'next'
import { CreateSitePageFeature } from '@/features/admin/sites/new'
export const metadata: Metadata = {
  title: 'Create New Site',
  description: 'Add a new client website to the platform',
  robots: {
    index: false,
    follow: false,
  },
}
export const dynamic = 'force-dynamic'
export default async function AdminCreateSitePage() {
  return <Suspense fallback={null}><CreateSitePageFeature /></Suspense>
}
