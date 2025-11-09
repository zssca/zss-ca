/**
 * Validation script to check plan configuration
 * Run with: npx tsx scripts/validate-plans.ts
 */

import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/server'
import type { Plan as _Plan } from '@/lib/types/domain/plan.types'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const CHECKS = {
  PASS: '✅',
  FAIL: '❌',
  WARN: '⚠️',
  INFO: 'ℹ️',
}

interface ValidationResult {
  check: string
  status: 'pass' | 'fail' | 'warn'
  message: string
}

async function validatePlans() {
  const results: ValidationResult[] = []
  console.log('🔍 Validating Plan Configuration\n')

  try {
    // 1. Check database connection
    const supabase = await createClient()
    const { data: plans, error: dbError } = await supabase
      .from('plan')
      .select('*')
      .order('sort_order')

    if (dbError) {
      results.push({
        check: 'Database Connection',
        status: 'fail',
        message: `Failed to connect: ${dbError.message}`,
      })
      return results
    }

    results.push({
      check: 'Database Connection',
      status: 'pass',
      message: 'Successfully connected to Supabase',
    })

    // 2. Check if plans exist
    if (!plans || plans.length === 0) {
      results.push({
        check: 'Plans Exist',
        status: 'fail',
        message: 'No plans found in database',
      })
      return results
    }

    results.push({
      check: 'Plans Exist',
      status: 'pass',
      message: `Found ${plans.length} plans`,
    })

    // 3. Check if any plans are active
    const activePlans = plans.filter(p => p.is_active)
    if (activePlans.length === 0) {
      results.push({
        check: 'Active Plans',
        status: 'fail',
        message: 'No active plans! Website cannot accept subscriptions',
      })
    } else {
      results.push({
        check: 'Active Plans',
        status: 'pass',
        message: `${activePlans.length} plans are active`,
      })
    }

    // 4. Check each plan configuration
    for (const plan of plans) {
      console.log(`\n📦 Checking ${plan.name}...`)

      // Check if plan has prices
      if (!plan.price_monthly_cents || !plan.price_yearly_cents) {
        results.push({
          check: `${plan.name} - Prices`,
          status: 'fail',
          message: 'Missing price data',
        })
      } else {
        results.push({
          check: `${plan.name} - Prices`,
          status: 'pass',
          message: `Monthly: $${plan.price_monthly_cents/100}, Yearly: $${plan.price_yearly_cents/100}`,
        })
      }

      // Check if plan has Stripe IDs
      if (!plan.stripe_product_id) {
        results.push({
          check: `${plan.name} - Stripe Product`,
          status: 'fail',
          message: 'Missing Stripe product ID',
        })
      } else if (!plan.stripe_price_id_monthly || !plan.stripe_price_id_yearly) {
        results.push({
          check: `${plan.name} - Stripe Prices`,
          status: 'warn',
          message: 'Missing Stripe price IDs',
        })
      } else {
        results.push({
          check: `${plan.name} - Stripe Integration`,
          status: 'pass',
          message: 'Fully configured with Stripe',
        })
      }

      // Check features
      if (!plan.features || !Array.isArray(plan.features) || plan.features.length === 0) {
        results.push({
          check: `${plan.name} - Features`,
          status: 'warn',
          message: 'No features defined',
        })
      } else {
        results.push({
          check: `${plan.name} - Features`,
          status: 'pass',
          message: `${plan.features.length} features defined`,
        })
      }

      // Validate Stripe connection if configured
      const stripeKey = process.env['STRIPE_SECRET_KEY'];
      if (plan.stripe_product_id && stripeKey && stripeKey !== 'sk_test_placeholder') {
        try {
          const product = await stripe.products.retrieve(plan.stripe_product_id)
          if (product.active) {
            results.push({
              check: `${plan.name} - Stripe Product Active`,
              status: 'pass',
              message: 'Product is active in Stripe',
            })
          } else {
            results.push({
              check: `${plan.name} - Stripe Product Active`,
              status: 'warn',
              message: 'Product is inactive in Stripe',
            })
          }

          // Check if prices match
          if (plan.stripe_price_id_monthly && plan.price_monthly_cents !== null) {
            const monthlyPrice = await stripe.prices.retrieve(plan.stripe_price_id_monthly)
            if (monthlyPrice.unit_amount !== plan.price_monthly_cents) {
              results.push({
                check: `${plan.name} - Monthly Price Sync`,
                status: 'warn',
                message: `Database: $${plan.price_monthly_cents/100}, Stripe: $${monthlyPrice.unit_amount!/100}`,
              })
            }
          }
        } catch (error) {
          results.push({
            check: `${plan.name} - Stripe Validation`,
            status: 'fail',
            message: `Could not validate: ${error instanceof Error ? error.message : 'Unknown error'}`,
          })
        }
      }
    }

    // 5. Check RLS policies
    // Note: RPC function get_policies_for_table doesn't exist, skipping RLS check
    const policies: unknown[] = []
    const policyError = null

    if (policyError) {
      results.push({
        check: 'RLS Policies',
        status: 'warn',
        message: 'Could not check RLS policies',
      })
    } else if (!policies || policies.length === 0) {
      results.push({
        check: 'RLS Policies',
        status: 'fail',
        message: 'No RLS policies found on plan table',
      })
    } else {
      results.push({
        check: 'RLS Policies',
        status: 'pass',
        message: `${policies.length} RLS policies configured`,
      })
    }

  } catch (error) {
    results.push({
      check: 'General',
      status: 'fail',
      message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown'}`,
    })
  }

  return results
}

// Run validation and display results
async function main() {
  const results = await validatePlans()

  console.log('\n\n📊 Validation Results\n' + '='.repeat(50) + '\n')

  let passCount = 0
  let failCount = 0
  let warnCount = 0

  for (const result of results) {
    const icon = result.status === 'pass' ? CHECKS.PASS
      : result.status === 'fail' ? CHECKS.FAIL
      : CHECKS.WARN

    console.log(`${icon} ${result.check}`)
    console.log(`   ${result.message}`)

    if (result.status === 'pass') passCount++
    else if (result.status === 'fail') failCount++
    else warnCount++
  }

  console.log('\n' + '='.repeat(50))
  console.log('Summary:')
  console.log(`${CHECKS.PASS} Passed: ${passCount}`)
  console.log(`${CHECKS.FAIL} Failed: ${failCount}`)
  console.log(`${CHECKS.WARN} Warnings: ${warnCount}`)

  if (failCount > 0) {
    console.log('\n⚠️  Critical issues found! Fix the failures before going to production.')
    process.exit(1)
  } else if (warnCount > 0) {
    console.log('\n⚠️  Some warnings found. Review them but not blocking.')
  } else {
    console.log('\n✨ All checks passed! Your plan configuration is ready.')
  }
}

main().catch(console.error)
