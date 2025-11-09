/**
 * Test script for the complete pricing flow
 * Run with: npx tsx scripts/test-pricing-flow.ts
 */

import { createClient } from '@/lib/supabase/server'
import { getActivePlans, getPlansWithPrices } from '@/features/marketing/pricing/api/queries'
import { formatPrice } from '@/lib/types/domain/plan.types'

const TESTS = {
  PASS: '✅',
  FAIL: '❌',
  INFO: 'ℹ️',
}

interface TestResult {
  test: string
  passed: boolean
  message: string
  error?: Error
}

async function runTests() {
  const results: TestResult[] = []
  console.log('🧪 Testing Pricing Flow\n')

  try {
    // Test 1: Fetch active plans
    console.log('Test 1: Fetching active plans...')
    try {
      const plans = await getActivePlans()

      if (!plans || plans.length === 0) {
        results.push({
          test: 'Fetch Active Plans',
          passed: false,
          message: 'No active plans returned',
        })
      } else {
        results.push({
          test: 'Fetch Active Plans',
          passed: true,
          message: `Successfully fetched ${plans.length} active plans`,
        })

        // Validate each plan
        for (const plan of plans) {
          console.log(`\n${TESTS.INFO} Plan: ${plan.name}`)
          console.log(`  - Slug: ${plan.slug}`)
          console.log(`  - Active: ${plan.is_active}`)
          console.log(`  - Monthly: ${plan.price_monthly_cents ? formatPrice(plan.price_monthly_cents) : 'N/A'}`)
          console.log(`  - Yearly: ${plan.price_yearly_cents ? formatPrice(plan.price_yearly_cents) : 'N/A'}`)
          console.log(`  - Features: ${Array.isArray(plan.features) ? plan.features.length : 0}`)
        }
      }
    } catch (error) {
      results.push({
        test: 'Fetch Active Plans',
        passed: false,
        message: 'Failed to fetch plans',
        error: error as Error,
      })
    }

    // Test 2: Get plans with prices
    console.log('\nTest 2: Getting plans with prices...')
    try {
      const basePlans = await getActivePlans()
      const plansWithPrices = await getPlansWithPrices(basePlans)

      if (!plansWithPrices || plansWithPrices.length === 0) {
        results.push({
          test: 'Get Plans with Prices',
          passed: false,
          message: 'No plans with prices returned',
        })
      } else {
        let allHavePrices = true
        for (const plan of plansWithPrices) {
          if (!plan.monthlyPrice || !plan.yearlyPrice) {
            allHavePrices = false
            console.log(`  ${TESTS.FAIL} ${plan.name} missing prices`)
          } else {
            console.log(`  ${TESTS.PASS} ${plan.name}: $${plan.monthlyPrice}/mo, $${plan.yearlyPrice}/yr`)
          }
        }

        results.push({
          test: 'Get Plans with Prices',
          passed: allHavePrices,
          message: allHavePrices
            ? 'All plans have prices'
            : 'Some plans missing prices',
        })
      }
    } catch (error) {
      results.push({
        test: 'Get Plans with Prices',
        passed: false,
        message: 'Failed to get plans with prices',
        error: error as Error,
      })
    }

    // Test 3: Database view
    console.log('\nTest 3: Testing plan_pricing view...')
    try {
      const supabase = await createClient()
      const { data: pricingView, error } = await supabase
        .from('plan_pricing')
        .select('*')

      if (error) {
        results.push({
          test: 'Plan Pricing View',
          passed: false,
          message: `View query failed: ${error.message}`,
        })
      } else if (!pricingView || pricingView.length === 0) {
        results.push({
          test: 'Plan Pricing View',
          passed: false,
          message: 'No data from plan_pricing view',
        })
      } else {
        results.push({
          test: 'Plan Pricing View',
          passed: true,
          message: `View returned ${pricingView.length} plans with calculated savings`,
        })

        for (const plan of pricingView) {
          console.log(`  ${TESTS.INFO} ${plan.name}: ${plan.yearly_savings_percent}% annual savings`)
        }
      }
    } catch (error) {
      results.push({
        test: 'Plan Pricing View',
        passed: false,
        message: 'Failed to query view',
        error: error as Error,
      })
    }

    // Test 4: RLS Policies
    console.log('\nTest 4: Testing RLS policies...')
    try {
      const supabase = await createClient()

      // Try to read plans (should work for everyone)
      const { data: publicPlans, error: readError } = await supabase
        .from('plan')
        .select('id, name')
        .limit(1)

      if (readError) {
        results.push({
          test: 'RLS Read Policy',
          passed: false,
          message: `Cannot read plans: ${readError.message}`,
        })
      } else {
        results.push({
          test: 'RLS Read Policy',
          passed: true,
          message: 'Public read access working',
        })
      }

      // Try to update a plan (should fail unless admin)
      const { error: updateError } = await supabase
        .from('plan')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', publicPlans?.[0]?.id || '')

      if (updateError) {
        // This is expected - non-admins shouldn't update
        results.push({
          test: 'RLS Write Policy',
          passed: true,
          message: 'Write protection working (non-admins cannot update)',
        })
      } else {
        results.push({
          test: 'RLS Write Policy',
          passed: false,
          message: 'WARNING: Non-admin could update plans!',
        })
      }
    } catch (error) {
      results.push({
        test: 'RLS Policies',
        passed: false,
        message: 'Failed to test RLS',
        error: error as Error,
      })
    }

    // Test 5: Feature structure
    console.log('\nTest 5: Testing feature structure...')
    try {
      const plans = await getActivePlans()
      let allFeaturesValid = true

      for (const plan of plans) {
        if (!plan.features || !Array.isArray(plan.features)) {
          allFeaturesValid = false
          console.log(`  ${TESTS.FAIL} ${plan.name}: No features array`)
        } else {
          let validFeatures = true
          for (const feature of plan.features) {
            // Type guard for feature object
            if (
              !feature ||
              typeof feature !== 'object' ||
              !('name' in feature) ||
              !('included' in feature) ||
              typeof feature['included'] !== 'boolean'
            ) {
              validFeatures = false
              break
            }
          }

          if (validFeatures) {
            console.log(`  ${TESTS.PASS} ${plan.name}: ${plan.features.length} valid features`)
          } else {
            console.log(`  ${TESTS.FAIL} ${plan.name}: Invalid feature structure`)
            allFeaturesValid = false
          }
        }
      }

      results.push({
        test: 'Feature Structure',
        passed: allFeaturesValid,
        message: allFeaturesValid
          ? 'All plans have valid feature structure'
          : 'Some plans have invalid features',
      })
    } catch (error) {
      results.push({
        test: 'Feature Structure',
        passed: false,
        message: 'Failed to test features',
        error: error as Error,
      })
    }

  } catch (error) {
    results.push({
      test: 'General',
      passed: false,
      message: 'Unexpected error during testing',
      error: error as Error,
    })
  }

  return results
}

// Run tests and display results
async function main() {
  const results = await runTests()

  console.log('\n\n📊 Test Results\n' + '='.repeat(50) + '\n')

  let passCount = 0
  let failCount = 0

  for (const result of results) {
    const icon = result.passed ? TESTS.PASS : TESTS.FAIL
    console.log(`${icon} ${result.test}`)
    console.log(`   ${result.message}`)

    if (result.error) {
      console.log(`   Error: ${result.error.message}`)
    }

    if (result.passed) passCount++
    else failCount++
  }

  console.log('\n' + '='.repeat(50))
  console.log('Summary:')
  console.log(`${TESTS.PASS} Passed: ${passCount}`)
  console.log(`${TESTS.FAIL} Failed: ${failCount}`)

  if (failCount > 0) {
    console.log('\n⚠️  Some tests failed. Review the errors above.')
    process.exit(1)
  } else {
    console.log('\n✨ All tests passed! The pricing flow is working correctly.')
  }
}

main().catch(console.error)
