import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SiteDetailFeature } from '@/features/client/sites'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Site Details',
  description: 'View analytics and information for your site',
  robots: { index: false, follow: false },
}
export default async function ClientSiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <Suspense fallback={null}><SiteDetailFeature id={id} /></Suspense>
}
