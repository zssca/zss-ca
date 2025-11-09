import { Suspense } from 'react'
import type { Metadata } from 'next'
import { NotificationsPageFeature } from '@/features/admin/notifications'
export const metadata: Metadata = {
  title: 'Notifications',
  description: 'View and manage system notifications',
  robots: {
    index: false,
    follow: false,
  },
}
export const dynamic = 'force-dynamic'
export default async function AdminNotificationsPage() {
  return <Suspense fallback={null}><NotificationsPageFeature /></Suspense>
}
