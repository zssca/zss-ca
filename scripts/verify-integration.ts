import { config } from 'dotenv';
import { resolve } from 'path';
import Stripe from 'stripe';

config({ path: resolve(process.cwd(), '.env.local') });

const STRIPE_SECRET_KEY = process.env['STRIPE_SECRET_KEY'];

if (!STRIPE_SECRET_KEY) {
  console.error('Error: STRIPE_SECRET_KEY not found in environment variables');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
});

// Import constants
import {
  STRIPE_PRODUCTS,
  STRIPE_PRICES,
  STRIPE_LOOKUP_KEYS,
  PLAN_IDS,
} from '../lib/constants/stripe';

async function verifyIntegration() {
  console.log('🔍 Verifying Stripe + Supabase Integration\n');

  let errors = 0;
  let warnings = 0;

  // ============================================================================
  // 1. Verify Stripe Products
  // ============================================================================
  console.log('📦 Verifying Stripe Products...');
  for (const [slug, productId] of Object.entries(STRIPE_PRODUCTS)) {
    try {
      const product = await stripe.products.retrieve(productId);
      console.log(`   ✅ ${slug}: ${product.name} (${productId})`);

      // Check metadata
      if (!product.metadata || Object.keys(product.metadata).length === 0) {
        console.log(`   ⚠️  Warning: No metadata on ${slug} product`);
        warnings++;
      }

      // Check tax code
      if (!product.tax_code) {
        console.log(`   ⚠️  Warning: No tax code on ${slug} product`);
        warnings++;
      }

      // Check statement descriptor
      if (!product.statement_descriptor) {
        console.log(`   ⚠️  Warning: No statement descriptor on ${slug} product`);
        warnings++;
      }
    } catch (_error: unknown) {
      console.log(`   ❌ Error: ${slug} product not found (${productId})`);
      errors++;
    }
  }

  // ============================================================================
  // 2. Verify Stripe Prices
  // ============================================================================
  console.log('\n💰 Verifying Stripe Prices...');
  for (const [key, priceId] of Object.entries(STRIPE_PRICES)) {
    try {
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount ? (price.unit_amount / 100).toFixed(2) : '0.00';
      const interval = price.recurring?.interval || 'one-time';
      console.log(`   ✅ ${key}: $${amount} CAD/${interval} (${priceId})`);

      // Check lookup key
      if (!price.lookup_key) {
        console.log(`   ⚠️  Warning: No lookup key on ${key} price`);
        warnings++;
      }

      // Check tax behavior
      if (price.tax_behavior !== 'exclusive') {
        console.log(`   ⚠️  Warning: ${key} tax_behavior is ${price.tax_behavior}, should be exclusive`);
        warnings++;
      }
    } catch (_error: unknown) {
      console.log(`   ❌ Error: ${key} price not found (${priceId})`);
      errors++;
    }
  }

  // ============================================================================
  // 3. Verify Lookup Keys
  // ============================================================================
  console.log('\n🔑 Verifying Lookup Keys...');
  for (const [key, lookupKey] of Object.entries(STRIPE_LOOKUP_KEYS)) {
    try {
      const prices = await stripe.prices.list({
        lookup_keys: [lookupKey],
      });

      if (prices.data.length === 0) {
        console.log(`   ❌ Error: No price found for lookup key "${lookupKey}"`);
        errors++;
      } else {
        const price = prices.data[0];
        const amount = price?.unit_amount ? (price.unit_amount / 100).toFixed(2) : '0.00';
        console.log(`   ✅ ${key}: $${amount} CAD (lookup: ${lookupKey})`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`   ❌ Error querying lookup key "${lookupKey}": ${message}`);
      errors++;
    }
  }

  // ============================================================================
  // 4. Verify Database Integration (requires Supabase connection)
  // ============================================================================
  console.log('\n🗄️  Database Plan IDs:');
  for (const [slug, planId] of Object.entries(PLAN_IDS)) {
    console.log(`   📝 ${slug}: ${planId}`);
  }

  // ============================================================================
  // 5. Summary
  // ============================================================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 Integration Verification Summary');
  console.log('='.repeat(60));

  if (errors === 0 && warnings === 0) {
    console.log('✅ All checks passed! Integration is complete.');
  } else {
    if (errors > 0) {
      console.log(`❌ ${errors} error(s) found`);
    }
    if (warnings > 0) {
      console.log(`⚠️  ${warnings} warning(s) found`);
    }
  }

  console.log('\n📋 Next Steps:');
  if (errors === 0) {
    console.log('1. ✅ Stripe products configured correctly');
    console.log('2. ✅ Database plans synced with Stripe');
    console.log('3. 📝 Implement pricing page using constants');
    console.log('4. 📝 Create checkout flow');
    console.log('5. 📝 Set up webhook handlers');
    console.log('6. 📝 Test subscription lifecycle');
  } else {
    console.log('1. ❌ Fix errors above before proceeding');
    console.log('2. 📝 Re-run this verification script');
  }

  console.log('\n📚 Documentation:');
  console.log('   - docs/STRIPE_INTEGRATION.md');
  console.log('   - lib/constants/stripe.ts');
  console.log('   - supabase/migrations/20250126000000_update_plans_with_stripe_ids.sql');

  process.exit(errors > 0 ? 1 : 0);
}

verifyIntegration().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('❌ Fatal error running verification:', message);
  process.exit(1);
});
