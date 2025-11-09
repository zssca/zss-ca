import 'server-only'

import { cache } from 'react'
import { createClient, requireAuth, requireAdminRole } from '@/lib/supabase'
import type { TicketPriority, TicketStatus } from '@/lib/types/database-aliases'

export interface AdminDashboardStats {
  totalClients: number
  activeSubscriptions: number
  liveSites: number
  openTickets: number
  recentClients: Array<{
    id: string
    contact_name: string | null
    contact_email: string | null
    company_name: string | null
    created_at: string
  }>
  recentTickets: Array<{
    id: string
    subject: string
    status: TicketStatus
    priority: TicketPriority
    created_at: string
    profile_id: string
    profile: { contact_name: string | null; company_name: string | null } | null
  }>
  planDistribution: Record<string, number>
  statusDistribution: Record<string, number>
}

// ✅ Next.js 15+: Use React cache() for request deduplication within same render
// Note: This is NOT Next.js cache - it only deduplicates requests in same render
// The page uses dynamic = 'force-dynamic' for real-time data
export const getAdminDashboardStats = cache(async (): Promise<AdminDashboardStats> => {
  const supabase = await createClient()
  const user = await requireAuth(supabase)
  await requireAdminRole(supabase, user.id)

  // ✅ Next.js 15+: Use Promise.all to avoid sequential waterfall
  const [
    { count: totalClients },
    { count: activeSubscriptions },
    { count: liveSites },
    { count: openTickets },
    { data: recentClients },
    { data: ticketsData },
    { data: subscriptionsByPlan },
    { data: sitesByStatus },
  ] = await Promise.all([
    // Get total clients count
    supabase
      .from('profile')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'client')
      .is('deleted_at', null),

    // Get active subscriptions count
    supabase
      .from('subscription')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .is('deleted_at', null),

    // Get live sites count
    supabase
      .from('client_site')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'live')
      .is('deleted_at', null),

    // Get open tickets count
    supabase
      .from('support_ticket')
      .select('id', { count: 'exact', head: true })
      .in('status', ['open', 'in_progress']),

    // Get recent clients
    supabase
      .from('profile')
      .select('id, contact_name, contact_email, company_name, created_at')
      .eq('role', 'client')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5),

    // Get recent tickets with profile info (use join to avoid N+1 queries)
    supabase
      .from('support_ticket')
      .select('id, subject, status, priority, created_at, profile_id, profile:profile_id!support_ticket_profile_fk(contact_name, company_name)')
      .order('created_at', { ascending: false })
      .limit(5),

    // Get subscription breakdown by plan
    supabase
      .from('subscription')
      .select('plan_id, plan:plan_id(name)')
      .eq('status', 'active')
      .is('deleted_at', null),

    // Get sites by status
    supabase
      .from('client_site')
      .select('status')
      .is('deleted_at', null),
  ])

  // Map tickets data with profile already joined
  const recentTickets = (ticketsData || []) as unknown as AdminDashboardStats['recentTickets']

  // Calculate plan distribution
  const planDistribution = subscriptionsByPlan?.reduce((acc: Record<string, number>, sub: { plan?: { name?: string } | null }) => {
    const planName = sub.plan?.name ?? 'Unknown'
    acc[planName] = (acc[planName] ?? 0) + 1
    return acc
  }, {} as Record<string, number>) ?? {}

  // Calculate site status distribution
  const statusDistribution = sitesByStatus?.reduce((acc: Record<string, number>, site: { status: string }) => {
    acc[site.status] = (acc[site.status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>) ?? {}

  return {
    totalClients: totalClients ?? 0,
    activeSubscriptions: activeSubscriptions ?? 0,
    liveSites: liveSites ?? 0,
    openTickets: openTickets ?? 0,
    recentClients: recentClients ?? [],
    recentTickets: recentTickets ?? [],
    planDistribution,
    statusDistribution,
  }
})
