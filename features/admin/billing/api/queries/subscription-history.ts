"use server"

import { createClient } from "@/lib/supabase/server"
import {
  SubscriptionTimelineEventSchema,
  validateArray,
  type SubscriptionTimelineEvent,
} from '@/lib/types/validation/database-joins'

// Re-export type for external consumers
export type { SubscriptionTimelineEvent }

export async function getSubscriptionTimeline(
  subscriptionId: string
): Promise<SubscriptionTimelineEvent[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("subscription_history")
    .select(
      `
      *,
      from_plan:plan!subscription_history_from_plan_id_fkey(id, name, stripe_price_id),
      to_plan:plan!subscription_history_to_plan_id_fkey(id, name, stripe_price_id),
      profile!subscription_history_profile_id_fkey(full_name, email)
    `
    )
    .eq("subscription_id", subscriptionId)
    .order("occurred_at", { ascending: false })

  if (error) {
    console.error("Error fetching subscription timeline:", error)
    throw new Error("Failed to fetch subscription timeline")
  }

  // Runtime validation with Zod (replaces unsafe type casting)
  return validateArray(
    SubscriptionTimelineEventSchema,
    data ?? [],
    'Failed to validate subscription timeline'
  )
}

export async function getCustomerSubscriptionHistory(
  profileId: string
): Promise<SubscriptionTimelineEvent[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("subscription_history")
    .select(
      `
      *,
      from_plan:plan!subscription_history_from_plan_id_fkey(id, name, stripe_price_id),
      to_plan:plan!subscription_history_to_plan_id_fkey(id, name, stripe_price_id),
      profile!subscription_history_profile_id_fkey(full_name, email)
    `
    )
    .eq("profile_id", profileId)
    .order("occurred_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("Error fetching customer subscription history:", error)
    throw new Error("Failed to fetch customer subscription history")
  }

  // Runtime validation with Zod (replaces unsafe type casting)
  return validateArray(
    SubscriptionTimelineEventSchema,
    data ?? [],
    'Failed to validate customer subscription history'
  )
}

export async function getRecentSubscriptionChanges(
  limit: number = 20
): Promise<SubscriptionTimelineEvent[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("subscription_history")
    .select(
      `
      *,
      from_plan:plan!subscription_history_from_plan_id_fkey(id, name, stripe_price_id),
      to_plan:plan!subscription_history_to_plan_id_fkey(id, name, stripe_price_id),
      profile!subscription_history_profile_id_fkey(full_name, email)
    `
    )
    .order("occurred_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching recent subscription changes:", error)
    throw new Error("Failed to fetch recent subscription changes")
  }

  // Runtime validation with Zod (replaces unsafe type casting)
  return validateArray(
    SubscriptionTimelineEventSchema,
    data ?? [],
    'Failed to validate recent subscription changes'
  )
}

export async function getSubscriptionStats() {
  console.warn("get_subscription_change_stats RPC not available; returning defaults.")
  return {
    total_changes: 0,
    upgrades: 0,
    downgrades: 0,
    cancellations: 0,
    reactivations: 0,
    total_mrr_change: 0,
    total_arr_change: 0,
  }
}
