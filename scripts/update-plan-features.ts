/**
 * Script to update plan features with proper structure
 * Run with: npx tsx scripts/update-plan-features.ts
 */

import { createClient } from '@supabase/supabase-js'
import type { PlanFeature } from '@/lib/types/domain/plan.types'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

// Define structured features for each plan
const planFeatures: Record<string, PlanFeature[]> = {
  essential: [
    { name: 'Pages', value: 3, included: true, description: 'Beautiful, mobile-perfected pages' },
    { name: 'Content Updates', value: 2, included: true, description: 'Monthly content updates' },
    { name: 'SSL Certificate', included: true, description: 'Secure HTTPS connection' },
    { name: 'Custom Domain', included: true, description: 'Your own domain name' },
    { name: 'Mobile Responsive', included: true, description: 'Perfect on all devices' },
    { name: 'Basic SEO', included: true, description: 'Search engine optimization' },
    { name: 'Email Support', included: true, description: '48-hour response time' },
    { name: 'Daily Backups', included: true, description: 'Automatic daily backups' },
    { name: 'Custom Branding', included: false },
    { name: 'E-commerce', included: false },
  ],
  growth: [
    { name: 'Pages', value: 7, included: true, description: 'Expand your online presence' },
    { name: 'Content Updates', value: 5, included: true, description: 'Monthly content updates' },
    { name: 'SSL Certificate', included: true, description: 'Secure HTTPS connection' },
    { name: 'Custom Domain', included: true, description: 'Your own domain name' },
    { name: 'Mobile Responsive', included: true, description: 'Perfect on all devices' },
    { name: 'Advanced SEO', included: true, description: 'Advanced search optimization' },
    { name: 'Priority Email Support', included: true, description: '24-hour response time' },
    { name: 'Daily Backups', included: true, description: 'Automatic daily backups' },
    { name: 'Custom Branding', included: true, description: 'Your brand, your style' },
    { name: 'Contact Forms', included: true, description: 'Smart contact forms' },
    { name: 'Monthly Reports', included: true, description: 'Performance analytics' },
    { name: 'Social Media Integration', included: true, description: 'Connect social accounts' },
    { name: 'E-commerce', included: false },
    { name: 'Blog Engine', included: false },
  ],
  pro: [
    { name: 'Pages', value: 10, included: true, description: 'Professional web presence' },
    { name: 'Content Updates', value: 'Unlimited', included: true, description: 'Unlimited monthly updates' },
    { name: 'SSL Certificate', included: true, description: 'Secure HTTPS connection' },
    { name: 'Custom Domain', included: true, description: 'Your own domain name' },
    { name: 'Mobile Responsive', included: true, description: 'Perfect on all devices' },
    { name: 'Advanced SEO', included: true, description: 'Advanced search optimization' },
    { name: 'VIP Support', included: true, description: '6-hour response time' },
    { name: 'Daily Backups', included: true, description: 'Automatic daily backups' },
    { name: 'Custom Branding', included: true, description: 'Your brand, your style' },
    { name: 'Contact Forms', included: true, description: 'Smart contact forms' },
    { name: 'Monthly Reports', included: true, description: 'Performance analytics' },
    { name: 'Social Media Integration', included: true, description: 'Connect social accounts' },
    { name: 'E-commerce', value: 50, included: true, description: 'Up to 50 products' },
    { name: 'Blog Engine', included: true, description: 'Content management system' },
    { name: 'Advanced Analytics', included: true, description: 'Detailed insights' },
    { name: 'Custom Integrations', included: true, description: 'Third-party services' },
    { name: 'Monthly Strategy Call', included: true, description: 'Growth consultation' },
    { name: 'A/B Testing', included: false },
  ],
  elite: [
    { name: 'Pages', value: 'Unlimited', included: true, description: 'Unlimited pages' },
    { name: 'Content Updates', value: 'Unlimited', included: true, description: 'Unlimited updates' },
    { name: 'SSL Certificate', included: true, description: 'Secure HTTPS connection' },
    { name: 'Custom Domain', included: true, description: 'Multiple domain support' },
    { name: 'Mobile Responsive', included: true, description: 'Perfect on all devices' },
    { name: 'Advanced SEO', included: true, description: 'Enterprise SEO' },
    { name: 'Dedicated Manager', included: true, description: 'Your personal account manager' },
    { name: 'Real-time Chat Support', included: true, description: 'Instant support' },
    { name: 'Daily Backups', included: true, description: 'Automatic daily backups' },
    { name: 'Custom Branding', included: true, description: 'White-label options' },
    { name: 'Contact Forms', included: true, description: 'Advanced form builder' },
    { name: 'Monthly Reports', included: true, description: 'Custom reporting' },
    { name: 'Social Media Integration', included: true, description: 'Full social suite' },
    { name: 'E-commerce', value: 'Unlimited', included: true, description: 'Unlimited products' },
    { name: 'Blog Engine', included: true, description: 'Advanced CMS' },
    { name: 'Advanced Analytics', included: true, description: 'Custom dashboards' },
    { name: 'Custom Integrations', included: true, description: 'Enterprise integrations' },
    { name: 'Monthly Strategy Call', included: true, description: 'Weekly consultations available' },
    { name: 'A/B Testing', included: true, description: 'Conversion optimization' },
    { name: 'Multi-language Support', included: true, description: 'Global reach' },
    { name: '99.9% Uptime SLA', included: true, description: 'Guaranteed availability' },
  ],
}

async function updatePlanFeatures() {
  console.log('🚀 Updating plan features...\n')

  for (const [slug, features] of Object.entries(planFeatures)) {
    console.log(`📦 Updating ${slug} plan...`)

    const { error } = await supabase
      .from('plan')
      .update({
        features: features as unknown as object, // Cast for JSONB column
        updated_at: new Date().toISOString()
      })
      .eq('slug', slug)

    if (error) {
      console.error(`❌ Error updating ${slug}:`, error)
    } else {
      console.log(`✅ Updated ${slug} with ${features.length} features`)
    }
  }

  console.log('\n✨ Done!')
}

// Run the update
updatePlanFeatures()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
