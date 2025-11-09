import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ClientDetailPageFeature } from '@/features/admin/clients/[id]'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Client Details',
  description: 'Manage client information and sites',
  robots: { index: false, follow: false },
}
export default async function AdminClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <Suspense fallback={null}><ClientDetailPageFeature clientId={id} /></Suspense>
}
