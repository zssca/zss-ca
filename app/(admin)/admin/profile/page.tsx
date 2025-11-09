import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AdminProfileFeature } from '@/features/client/profile'
export const metadata: Metadata = {
  title: 'Profile Settings',
  description: 'Manage your account information and preferences',
  robots: {
    index: false,
    follow: false,
  },
}
export const dynamic = 'force-dynamic'
export default async function AdminProfilePage() {
  return <Suspense fallback={null}><AdminProfileFeature /></Suspense>
}
