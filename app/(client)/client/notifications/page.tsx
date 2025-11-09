import { Suspense } from 'react'
import type { Metadata } from 'next'
import { NotificationsFeature } from '@/features/client/notifications'
export const metadata: Metadata = {
  title: 'Notifications',
  description: 'View your notifications and updates',
  robots: {
    index: false,
    follow: false,
  },
}
export const dynamic = 'force-dynamic'
export default async function ClientNotificationsPage() {
  return <Suspense fallback={null}><NotificationsFeature /></Suspense>
}
