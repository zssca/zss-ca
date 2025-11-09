import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SiteDetailPageFeature } from '@/features/admin/sites/[id]'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Site Management',
  description: 'Manage site configuration and deployment',
  robots: { index: false, follow: false },
}
export default async function AdminSiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <Suspense fallback={null}><SiteDetailPageFeature siteId={id} /></Suspense>
}
