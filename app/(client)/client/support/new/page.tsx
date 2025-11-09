import { Suspense } from 'react'
import type { Metadata } from 'next'
import { NewTicketFeature } from '@/features/client/support/components'
export const metadata: Metadata = {
  title: 'New Support Ticket',
  description: 'Create a new support ticket',
  robots: {
    index: false,
    follow: false,
  },
}
export const dynamic = 'force-dynamic'
export default async function NewSupportTicketPage() {
  return <Suspense fallback={null}><NewTicketFeature /></Suspense>
}
