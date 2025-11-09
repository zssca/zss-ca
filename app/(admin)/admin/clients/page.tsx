import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ClientsPageFeature } from '@/features/admin/clients'
export const metadata: Metadata = {
  title: 'Clients',
  description: 'Manage client accounts and profiles',
  robots: {
    index: false,
    follow: false,
  },
}
export const dynamic = 'force-dynamic'
export default async function AdminClientsPage() {
  return <Suspense fallback={null}><ClientsPageFeature /></Suspense>
}
