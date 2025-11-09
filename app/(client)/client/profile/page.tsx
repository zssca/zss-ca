import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ProfileFeature } from '@/features/client/profile'
export const metadata: Metadata = {
  title: 'Profile',
  description: 'Manage your account information and settings',
  robots: {
    index: false,
    follow: false,
  },
}
export const dynamic = 'force-dynamic'
export default async function ProfilePage() {
  return <Suspense fallback={null}><ProfileFeature /></Suspense>
}
