import { Suspense } from 'react'
import type { Metadata } from 'next'
import { BillingPageFeature } from '@/features/admin/billing'
export const metadata: Metadata = {
  title: 'Billing',
  description: 'Manage billing and invoices',
  robots: {
    index: false,
    follow: false,
  },
}
export const dynamic = 'force-dynamic'
export default async function AdminBillingPage() {
  return <Suspense fallback={null}><BillingPageFeature /></Suspense>
}
