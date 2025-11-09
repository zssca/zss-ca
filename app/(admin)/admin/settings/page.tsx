import { Suspense } from 'react'
import type { Metadata } from 'next'
import { SettingsPageFeature } from '@/features/admin/settings'
export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage application settings and configuration',
  robots: {
    index: false,
    follow: false,
  },
}
export const dynamic = 'force-dynamic'
export default async function AdminSettingsPage() {
  return <Suspense fallback={null}><SettingsPageFeature /></Suspense>
}
