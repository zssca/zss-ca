#!/usr/bin/env node

/**
 * Seed Plans to Database
 *
 * This script seeds subscription plans to the Supabase database.
 * Run this to populate your plans table with the subscription tiers.
 *
 * Usage:
 *   npm run seed-plans
 *
 * Or directly:
 *   tsx scripts/seed-plans.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env['NEXT_PUBLIC_SUPABASE_URL']
const SUPABASE_ANON_KEY = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const plans = [
  {
    name: 'Essential',
    slug: 'essential',
    description: 'Perfect for startups and small businesses getting online',
    currency_code: 'CAD',
    page_limit: 5,
    revision_limit: 10,
    features: [
      { name: 'Up to 5 pages', description: 'Perfect for a basic marketing site', included: true },
      { name: '10 revisions per month', description: 'Regular content updates and tweaks', included: true },
      { name: '48-hour response time', description: 'Quick turnaround on support requests', included: true },
      { name: 'Basic maintenance', description: 'Security updates and monitoring', included: true },
      { name: 'Mobile responsive design', description: 'Optimized for all devices', included: true },
    ],
    is_active: true,
    sort_order: 1,
    setup_fee_cents: 0,
    stripe_price_id_monthly: 'price_1SMRoVP9fFsmlAaF9zkoG6QT', // Replace with your actual Stripe price ID
    stripe_price_id_yearly: 'price_1SMRoVP9fFsmlAaFUMgWLMJO', // Replace with your actual Stripe price ID
  },
  {
    name: 'Growth',
    slug: 'growth',
    description: 'Ideal for growing companies with evolving web needs',
    currency_code: 'CAD',
    page_limit: 15,
    revision_limit: 30,
    features: [
      { name: 'Up to 15 pages', description: 'Room to grow your online presence', included: true },
      { name: '30 revisions per month', description: 'Frequent updates and improvements', included: true },
      { name: '24-hour response time', description: 'Priority support when you need it', included: true },
      { name: 'Performance optimization', description: 'Speed and SEO improvements', included: true },
      { name: 'Basic analytics setup', description: 'Track your site performance', included: true },
      { name: 'Quarterly content review', description: 'Strategic content recommendations', included: true },
    ],
    is_active: true,
    sort_order: 2,
    setup_fee_cents: 0,
    stripe_price_id_monthly: 'price_1SMRosP9fFsmlAaFOWNtRgQZ', // Replace with your actual Stripe price ID
    stripe_price_id_yearly: 'price_1SMRosP9fFsmlAaFALCL8hxR', // Replace with your actual Stripe price ID
  },
  {
    name: 'Pro',
    slug: 'pro',
    description: 'Comprehensive solution for established businesses',
    currency_code: 'CAD',
    page_limit: null, // Unlimited
    revision_limit: null, // Unlimited
    features: [
      { name: 'Unlimited pages', description: 'No limits on your website size', included: true },
      { name: 'Unlimited revisions', description: 'Change anything, anytime', included: true },
      { name: 'Same-day response', description: 'Immediate attention to your needs', included: true },
      { name: 'Advanced integrations', description: 'Connect with your business tools', included: true },
      { name: 'Custom functionality', description: 'Tailored features for your needs', included: true },
      { name: 'Monthly strategy calls', description: 'Direct access to our team', included: true },
      { name: 'Priority development queue', description: 'Your requests come first', included: true },
    ],
    is_active: true,
    sort_order: 3,
    setup_fee_cents: 0,
    stripe_price_id_monthly: 'price_1SMRpHP9fFsmlAaFiJL0rNQF', // Replace with your actual Stripe price ID
    stripe_price_id_yearly: 'price_1SMRpHP9fFsmlAaF0UKwLXXz', // Replace with your actual Stripe price ID
  },
  {
    name: 'Elite',
    slug: 'elite',
    description: 'White-glove service for enterprise and high-growth companies',
    currency_code: 'CAD',
    page_limit: null, // Unlimited
    revision_limit: null, // Unlimited
    features: [
      { name: 'Everything in Pro', description: 'All Pro features included', included: true },
      { name: 'Dedicated account manager', description: 'Single point of contact', included: true },
      { name: 'Custom SLA', description: 'Guaranteed response times', included: true },
      { name: 'Weekly strategy sessions', description: 'Regular planning and review', included: true },
      { name: 'Multi-site management', description: 'Manage multiple properties', included: true },
      { name: 'Advanced security monitoring', description: 'Enterprise-grade protection', included: true },
      { name: 'Custom reporting', description: 'Tailored analytics and insights', included: true },
    ],
    is_active: true,
    sort_order: 4,
    setup_fee_cents: 0,
    stripe_price_id_monthly: null, // Contact for pricing
    stripe_price_id_yearly: null, // Contact for pricing
  },
]

async function seedPlans() {
  console.log('🌱 Starting to seed plans...\n')

  for (const plan of plans) {
    try {
      // Check if plan already exists
      const { data: existingPlan } = await supabase
        .from('plan')
        .select('id, name')
        .eq('slug', plan.slug)
        .single()

      if (existingPlan) {
        console.log(`✓ Plan "${plan.name}" already exists, updating...`)

        const { error } = await supabase
          .from('plan')
          .update(plan)
          .eq('slug', plan.slug)

        if (error) {
          console.error(`❌ Failed to update "${plan.name}":`, error.message)
        } else {
          console.log(`✓ Updated "${plan.name}"`)
        }
      } else {
        console.log(`📝 Creating plan "${plan.name}"...`)

        const { error } = await supabase
          .from('plan')
          .insert([plan])

        if (error) {
          console.error(`❌ Failed to create "${plan.name}":`, error.message)
        } else {
          console.log(`✓ Created "${plan.name}"`)
        }
      }
    } catch (error) {
      console.error(`❌ Error processing "${plan.name}":`, error)
    }
  }

  console.log('\n✨ Seeding complete!')
  console.log('\n⚠️  Important: Remember to update the Stripe price IDs with your actual values!')
  console.log('   Edit the price IDs in scripts/seed-plans.ts or directly in your database.')
}

seedPlans().catch(console.error)