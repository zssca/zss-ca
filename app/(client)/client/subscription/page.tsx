import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SubscriptionFeature } from '@/features/client/subscription/components/subscription-feature'
export const metadata: Metadata = {
  title: 'Subscription',
  description: 'Manage your subscription plan and billing',
  robots: {
    index: false,
    follow: false,
  },
}
export const dynamic = 'force-dynamic'
export default async function SubscriptionPage() {
  return <Suspense fallback={null}><SubscriptionFeature /></Suspense>
}
