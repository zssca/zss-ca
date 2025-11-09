import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AdminSupportFeature } from '@/features/admin/support'
export const metadata: Metadata = {
  title: 'Support Tickets',
  description: 'Manage and respond to customer support requests',
  robots: {
    index: false,
    follow: false,
  },
}
export const dynamic = 'force-dynamic'
export default async function AdminSupportPage() {
  return <Suspense fallback={null}><AdminSupportFeature /></Suspense>
}
