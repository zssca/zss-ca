import { Suspense } from 'react'
import type { Metadata } from 'next'
import { TicketDetailFeature } from '@/features/client/support/components'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Support Ticket',
  description: 'View your support ticket details and updates',
  robots: { index: false, follow: false },
}
export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <Suspense fallback={null}><TicketDetailFeature id={id} /></Suspense>
}
