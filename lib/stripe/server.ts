import 'server-only'

import Stripe from 'stripe'

/**
 * Stripe server-side client
 * Use this in Server Components and Server Actions only
 *
 * Note: Initialize with placeholder if STRIPE_SECRET_KEY not set (for build time)
 * Runtime checks should verify the key exists before calling Stripe API
 */
export const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || 'sk_test_placeholder', {
  apiVersion: '2025-10-29.clover',
  typescript: true,
})
