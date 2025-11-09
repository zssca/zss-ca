/**
 * Create Stripe Products and Prices with Best Practices
 *
 * This script creates all subscription plans following Stripe best practices:
 * - Metadata for tracking features and database IDs
 * - Lookup keys for easy price references
 * - Tax codes for automatic tax calculation
 * - Statement descriptors for bank statements
 * - Nicknames for internal reference
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import Stripe from 'stripe';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const STRIPE_SECRET_KEY = process.env['STRIPE_SECRET_KEY'];

if (!STRIPE_SECRET_KEY) {
  console.error('Error: STRIPE_SECRET_KEY not found in environment variables');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
});

interface PlanConfig {
  name: string;
  tier: string;
  description: string;
  statementDescriptor: string;
  metadata: Record<string, string>;
  monthlyPrice: number;
  annualPrice: number;
  position: number;
}

const PLANS: PlanConfig[] = [
  {
    name: 'Essential Plan',
    tier: 'essential',
    description: 'Perfect for solopreneurs & new businesses. Beautiful 3-page website, mobile-perfected design, SSL & backups, 2 content updates/month, email support.',
    statementDescriptor: 'ZSS Essential',
    metadata: {
      plan_tier: 'essential',
      max_pages: '3',
      content_updates_per_month: '2',
      support_type: 'email',
      support_response_time: '48_hours',
      ssl_included: 'true',
      custom_domain: 'true',
      mobile_responsive: 'true',
      seo_basic: 'true',
      position: '1',
    },
    monthlyPrice: 9700, // $97.00 CAD
    annualPrice: 97000, // $970.00 CAD (save $194)
    position: 1,
  },
  {
    name: 'Growth Plan',
    tier: 'growth',
    description: 'For businesses ready to scale. Up to 7 pages, custom branding, SEO optimization, smart contact forms, 5 content updates/month, priority support, monthly reports.',
    statementDescriptor: 'ZSS Growth',
    metadata: {
      plan_tier: 'growth',
      max_pages: '7',
      content_updates_per_month: '5',
      support_type: 'priority_email',
      support_response_time: '24_hours',
      ssl_included: 'true',
      custom_domain: 'true',
      mobile_responsive: 'true',
      custom_branding: 'true',
      seo_advanced: 'true',
      contact_forms: 'true',
      monthly_reports: 'true',
      social_media_integration: 'true',
      position: '2',
      most_popular: 'true',
    },
    monthlyPrice: 19700, // $197.00 CAD
    annualPrice: 197000, // $1,970.00 CAD (save $394)
    position: 2,
  },
  {
    name: 'Pro Plan',
    tier: 'pro',
    description: 'For established businesses. E-commerce ready (50 products), blog engine, advanced analytics, custom integrations, unlimited updates, VIP support, monthly strategy call.',
    statementDescriptor: 'ZSS Pro',
    metadata: {
      plan_tier: 'pro',
      max_pages: '10',
      content_updates_per_month: 'unlimited',
      support_type: 'vip',
      support_response_time: '6_hours',
      ssl_included: 'true',
      custom_domain: 'true',
      mobile_responsive: 'true',
      custom_branding: 'true',
      seo_advanced: 'true',
      ecommerce_products: '50',
      blog_enabled: 'true',
      advanced_analytics: 'true',
      custom_integrations: 'true',
      monthly_strategy_call: 'true',
      ab_testing: 'false',
      position: '3',
    },
    monthlyPrice: 39700, // $397.00 CAD
    annualPrice: 397000, // $3,970.00 CAD (save $794)
    position: 3,
  },
  {
    name: 'Elite Plan',
    tier: 'elite',
    description: 'For complex business needs. Unlimited pages/products, multi-language support, dedicated account manager, real-time chat, enterprise integrations, A/B testing, 99.9% uptime SLA.',
    statementDescriptor: 'ZSS Elite',
    metadata: {
      plan_tier: 'elite',
      max_pages: 'unlimited',
      content_updates_per_month: 'unlimited',
      support_type: 'dedicated_manager',
      support_response_time: 'realtime',
      ssl_included: 'true',
      custom_domain: 'true',
      mobile_responsive: 'true',
      custom_branding: 'true',
      seo_advanced: 'true',
      ecommerce_products: 'unlimited',
      blog_enabled: 'true',
      advanced_analytics: 'true',
      custom_integrations: 'true',
      multi_language: 'true',
      dedicated_account_manager: 'true',
      realtime_chat_support: 'true',
      ab_testing: 'true',
      white_label: 'true',
      uptime_sla: '99.9',
      position: '4',
    },
    monthlyPrice: 79700, // $797.00 CAD
    annualPrice: 797000, // $7,970.00 CAD (save $1,594)
    position: 4,
  },
];

async function createProductsAndPrices() {
  console.log('🚀 Creating Stripe Products and Prices with Best Practices\n');

  for (const plan of PLANS) {
    try {
      console.log(`📦 Creating ${plan.name}...`);

      // Create Product
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        type: 'service',
        statement_descriptor: plan.statementDescriptor,
        tax_code: 'txcd_10103100', // SaaS - Software as a Service
        metadata: plan.metadata,
      });

      console.log(`   ✅ Product created: ${product.id}`);

      // Create Monthly Price
      const monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.monthlyPrice,
        currency: 'cad',
        recurring: {
          interval: 'month',
        },
        lookup_key: `${plan.tier}_monthly`,
        nickname: `${plan.name} - Monthly`,
        tax_behavior: 'exclusive', // Tax added on top of price
        metadata: {
          tier: plan.tier,
          billing_cycle: 'monthly',
          savings: '0',
        },
      });

      console.log(`   ✅ Monthly price: ${monthlyPrice.id} (lookup: ${monthlyPrice.lookup_key})`);

      // Create Annual Price (with 20% discount)
      const annualPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.annualPrice,
        currency: 'cad',
        recurring: {
          interval: 'year',
        },
        lookup_key: `${plan.tier}_annual`,
        nickname: `${plan.name} - Annual`,
        tax_behavior: 'exclusive',
        metadata: {
          tier: plan.tier,
          billing_cycle: 'annual',
          savings: String((plan.monthlyPrice * 12) - plan.annualPrice),
        },
      });

      console.log(`   ✅ Annual price: ${annualPrice.id} (lookup: ${annualPrice.lookup_key})`);

      // Set monthly as default price
      await stripe.products.update(product.id, {
        default_price: monthlyPrice.id,
      });

      console.log(`   ✅ Default price set to monthly\n`);

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`   ❌ Error creating ${plan.name}:`, message);
    }
  }

  console.log('✨ All products and prices created successfully!');
  console.log('\n📋 Next Steps:');
  console.log('1. Verify in Stripe Dashboard: https://dashboard.stripe.com/products');
  console.log('2. Update your database plan table with Stripe product/price IDs');
  console.log('3. Use lookup keys in your code for easy reference (e.g., "essential_monthly")');
}

// Run the script
createProductsAndPrices()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error('\n❌ Fatal error:', message);
    process.exit(1);
  });
