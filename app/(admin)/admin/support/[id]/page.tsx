import { Suspense } from 'react'
import type { Metadata } from 'next'
import { TicketDetailPageFeature } from '@/features/admin/support/[id]'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Support Ticket',
  description: 'View and manage support ticket details',
  robots: { index: false, follow: false },
}
export default async function AdminTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <Suspense fallback={null}><TicketDetailPageFeature id={id} /></Suspense>
}
