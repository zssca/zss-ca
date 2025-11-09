import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import {
  BillingAlertWithDetailsSchema,
  validateArray,
} from '@/lib/types/validation/database-joins'

/**
 * Get all billing alerts
 */
export const getBillingAlerts = cache(async () => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('billing_alert')
    .select(`
      *,
      profile:profile_id!billing_alert_profile_id_fkey (
        id,
        contact_name,
        contact_email,
        company_name
      ),
      invoice:invoice_id!billing_alert_invoice_id_fkey (
        id,
        invoice_number,
        total,
        status,
        due_date
      ),
      payment_intent:payment_intent_id!billing_alert_payment_intent_id_fkey (
        id,
        amount,
        status
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching billing alerts:', error)
    throw error
  }

  // Runtime validation with Zod (replaces unsafe type casting)
  return validateArray(
    BillingAlertWithDetailsSchema,
    data ?? [],
    'Failed to validate billing alerts'
  )
})

/**
 * Get unresolved billing alerts
 */
export const getUnresolvedAlerts = cache(async () => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('billing_alert')
    .select(`
      *,
      profile:profile_id!billing_alert_profile_id_fkey (
        id,
        contact_name,
        contact_email,
        company_name,
        contact_phone
      ),
      invoice:invoice_id!billing_alert_invoice_id_fkey (
        id,
        invoice_number,
        total,
        status,
        due_date
      )
    `)
    .neq('status', 'resolved')
    .order('severity', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching unresolved alerts:', error)
    throw error
  }

  // Runtime validation with Zod (replaces unsafe type casting)
  return validateArray(
    BillingAlertWithDetailsSchema,
    data ?? [],
    'Failed to validate unresolved alerts'
  )
})

/**
 * Get billing alert statistics
 */
export const getBillingAlertStats = cache(async () => {
  const supabase = await createClient()

  const { data: alerts } = await supabase
    .from('billing_alert')
    .select('alert_type, severity, status')

  if (!alerts) {
    return {
      totalAlerts: 0,
      unresolvedAlerts: 0,
      criticalAlerts: 0,
      highAlerts: 0,
      mediumAlerts: 0,
      lowAlerts: 0,
      paymentFailedAlerts: 0,
      cardExpiringAlerts: 0,
      refundAlerts: 0,
    }
  }

  const unresolved = alerts.filter((a) => a.status !== 'resolved')

  const stats = {
    totalAlerts: alerts.length,
    unresolvedAlerts: unresolved.length,
    criticalAlerts: unresolved.filter((a) => a.severity === 'critical').length,
    highAlerts: unresolved.filter((a) => a.severity === 'high').length,
    mediumAlerts: unresolved.filter((a) => a.severity === 'medium').length,
    lowAlerts: unresolved.filter((a) => a.severity === 'low').length,
    paymentFailedAlerts: unresolved.filter((a) => a.alert_type === 'payment_failed').length,
    cardExpiringAlerts: unresolved.filter((a) => a.alert_type === 'card_expiring').length,
    refundAlerts: unresolved.filter((a) => a.alert_type === 'refund_issued').length,
  }

  return stats
})

/**
 * Get alerts by customer
 */
export const getAlertsByCustomer = cache(async (profileId: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('billing_alert')
    .select(`
      *,
      invoice:invoice_id!billing_alert_invoice_id_fkey (
        id,
        invoice_number,
        total,
        status
      )
    `)
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching customer alerts:', error)
    throw error
  }

  // Runtime validation with Zod (replaces unsafe type casting)
  return validateArray(
    BillingAlertWithDetailsSchema,
    data ?? [],
    'Failed to validate customer alerts'
  )
})
