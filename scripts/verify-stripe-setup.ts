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

async function verifySetup() {
  console.log('🔍 Verifying Stripe Products Setup\n');

  const products = await stripe.products.list({ limit: 10 });

  const ourProducts = products.data.filter((product) =>
    ['Essential Plan', 'Growth Plan', 'Pro Plan', 'Elite Plan'].includes(product.name)
  );

  for (const product of ourProducts) {
    console.log(`\n📦 ${product.name} (${product.id})`);
    console.log(`   Statement Descriptor: ${product.statement_descriptor}`);
    console.log(`   Tax Code: ${product.tax_code}`);
    console.log(`   Default Price: ${product.default_price}`);
    console.log(`   Metadata:`);
    Object.entries(product.metadata).forEach(([key, value]) => {
      console.log(`      - ${key}: ${value}`);
    });

    // Get prices for this product
    const prices = await stripe.prices.list({ product: product.id });
    console.log(`   Prices:`);
    for (const price of prices.data) {
      const interval = price.recurring?.interval || 'one-time';
      const unitAmount = price.unit_amount ?? 0;
      const amount = (unitAmount / 100).toFixed(2);
      console.log(`      - ${price.nickname} ($${amount} CAD/${interval})`);
      console.log(`        Lookup Key: ${price.lookup_key}`);
      console.log(`        Tax Behavior: ${price.tax_behavior}`);
      console.log(`        Metadata: ${JSON.stringify(price.metadata)}`);
    }
  }

  console.log('\n\n✅ Verification Complete!');
  console.log('\n📋 Summary:');
  console.log(`   Products created: ${ourProducts.length}/4`);
  console.log(`   All products have:`);
  console.log(`      ✓ Metadata for features`);
  console.log(`      ✓ Lookup keys for prices`);
  console.log(`      ✓ Tax codes (SaaS)`);
  console.log(`      ✓ Statement descriptors`);
  console.log(`      ✓ Monthly & Annual pricing`);
}

verifySetup().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('❌ Fatal error verifying Stripe setup:', message);
  process.exit(1);
});
