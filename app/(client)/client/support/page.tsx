import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SupportListFeature } from '@/features/client/support/components'
export const metadata: Metadata = {
  title: 'Support',
  description: 'Get help and view your support tickets',
  robots: {
    index: false,
    follow: false,
  },
}
export const dynamic = 'force-dynamic'
export default async function SupportPage() {
  return <Suspense fallback={null}><SupportListFeature /></Suspense>
}
