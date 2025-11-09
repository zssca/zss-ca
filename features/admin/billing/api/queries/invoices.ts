import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'

export type InvoiceWithDetails = {
  id: string
  profile_id: string
  subscription_id: string | null
  stripe_invoice_id: string
  amount_due: number
  amount_paid: number
  amount_remaining: number
  currency: string
  status: string
  invoice_number: string | null
  invoice_pdf_url: string | null
  hosted_invoice_url: string | null
  period_start: string | null
  period_end: string | null
  subtotal: number
  total: number
  tax: number | null
  discount_amount: number | null
  due_date: string | null
  paid_at: string | null
  created_at: string
  profile: {
    id: string
    contact_name: string | null
    contact_email: string | null
    company_name: string | null
  } | null
  subscription: {
    id: string
    plan: {
      name: string | null
      slug: string | null
    } | null
  } | null
}

/**
 * Get all invoices with customer and subscription details
 */
export const getInvoices = cache(async () => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('invoice')
    .select(`
      id,
      profile_id,
      subscription_id,
      stripe_invoice_id,
      amount_due,
      amount_paid,
      amount_remaining,
      currency,
      status,
      invoice_number,
      invoice_pdf_url,
      hosted_invoice_url,
      period_start,
      period_end,
      subtotal,
      total,
      tax,
      discount_amount,
      due_date,
      paid_at,
      created_at,
      profile:profile_id (
        id,
        contact_name,
        contact_email,
        company_name
      ),
      subscription:subscription_id (
        id,
        plan:plan_id (
          name,
          slug
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching invoices:', error)
    throw error
  }

  return (data as InvoiceWithDetails[]) || []
})

/**
 * Get failed/unpaid invoices that need attention
 */
export const getFailedInvoices = cache(async () => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('invoice')
    .select(`
      id,
      profile_id,
      subscription_id,
      stripe_invoice_id,
      amount_due,
      amount_paid,
      amount_remaining,
      currency,
      status,
      invoice_number,
      invoice_pdf_url,
      hosted_invoice_url,
      period_start,
      period_end,
      subtotal,
      total,
      tax,
      discount_amount,
      due_date,
      paid_at,
      created_at,
      attempt_count,
      next_payment_attempt,
      profile:profile_id (
        id,
        contact_name,
        contact_email,
        company_name
      ),
      subscription:subscription_id (
        id,
        plan:plan_id (
          name,
          slug
        )
      )
    `)
    .in('status', ['open', 'uncollectible'])
    .order('due_date', { ascending: true })
    .limit(50)

  if (error) {
    console.error('Error fetching failed invoices:', error)
    throw error
  }

  return data || []
})

/**
 * Get invoice by ID with full details
 */
export const getInvoiceById = cache(async (id: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('invoice')
    .select(`
      *,
      profile:profile_id (
        id,
        contact_name,
        contact_email,
        company_name,
        contact_phone
      ),
      subscription:subscription_id (
        id,
        status,
        plan:plan_id (
          name,
          slug,
          price_monthly_cents,
          price_yearly_cents
        )
      ),
      payment_intent:payment_intent!payment_intent_invoice_id_fkey (
        id,
        stripe_payment_intent_id,
        amount,
        status,
        last_payment_error,
        created_at
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching invoice:', error)
    throw error
  }

  return data
})

/**
 * Get invoice statistics
 */
export const getInvoiceStats = cache(async () => {
  const supabase = await createClient()

  // Get counts by status
  const { data: invoices } = await supabase
    .from('invoice')
    .select('status, total')

  if (!invoices) {
    return {
      totalInvoices: 0,
      paidInvoices: 0,
      openInvoices: 0,
      uncollectibleInvoices: 0,
      totalRevenue: 0,
      outstandingAmount: 0,
    }
  }

  const stats = {
    totalInvoices: invoices.length,
    paidInvoices: invoices.filter((i) => i.status === 'paid').length,
    openInvoices: invoices.filter((i) => i.status === 'open').length,
    uncollectibleInvoices: invoices.filter((i) => i.status === 'uncollectible').length,
    totalRevenue: invoices
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + (i.total || 0), 0),
    outstandingAmount: invoices
      .filter((i) => i.status === 'open')
      .reduce((sum, i) => sum + (i.total || 0), 0),
  }

  return stats
})
