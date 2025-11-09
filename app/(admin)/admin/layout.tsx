import type { Metadata } from 'next'
import { DashboardLayout } from '@/components/layout'
import { ADMIN_SIDEBAR_SECTIONS } from '@/lib/config'
import { ROUTES } from '@/lib/constants'
import { createClient, requireAuth, getUserProfile } from '@/lib/supabase'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const user = await requireAuth(supabase)

  // ✅ Next.js 15+: Must await headers() and createClient()
  // ✅ Parallel data fetching to avoid waterfall
  const profile = await getUserProfile(supabase, user.id)

  return (
    <DashboardLayout
      role="admin"
      user={{
        name: profile?.contact_name || user.email?.split('@')[0] || 'Admin',
        email: user.email || '',
      }}
      sidebarSections={ADMIN_SIDEBAR_SECTIONS}
      breadcrumbHomeHref={ROUTES.ADMIN_DASHBOARD}
      breadcrumbHomeLabel="Overview"
    >
      {children}
    </DashboardLayout>
  )
}
