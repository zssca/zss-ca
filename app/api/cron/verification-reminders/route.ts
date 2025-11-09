import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationReminders } from '@/lib/auth/send-verification-reminders'

/**
 * Cron endpoint for sending verification reminder emails
 *
 * This endpoint should be called by a cron service (e.g., Vercel Cron, GitHub Actions)
 * to periodically send verification reminders to unverified users.
 *
 * Security:
 * - Requires CRON_SECRET environment variable for authentication
 * - Should be called via authorized cron service only
 *
 * Recommended schedule: Every 6 hours
 *
 * Example cron config (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/verification-reminders",
 *     "schedule": "0 *\/6 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env['CRON_SECRET']

    if (!cronSecret) {
      console.error('CRON_SECRET not configured')
      return NextResponse.json(
        { error: 'Cron jobs not configured' },
        { status: 500 }
      )
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Invalid cron authorization')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Send verification reminders
    const result = await sendVerificationReminders()

    // Log the result
    console.log('Verification reminders result:', result)

    // Return response
    return NextResponse.json({
      success: result.success,
      sent: result.sent,
      errors: result.errors,
      message: result.message,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in verification reminders cron:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Disable caching for cron endpoints
export const dynamic = 'force-dynamic'
export const revalidate = 0
