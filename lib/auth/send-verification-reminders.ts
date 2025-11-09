'use server'

import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email/send'
import { sendOTPForEmailConfirmation } from './otp-helpers'

/**
 * Send verification reminder emails to unverified users
 *
 * This function:
 * 1. Fetches unverified users who need reminders (1, 3, or 7 days after signup)
 * 2. Generates fresh OTP codes for each user
 * 3. Sends reminder emails with verification links
 * 4. Records that reminders were sent
 *
 * Should be called via cron job or scheduled task
 */
export async function sendVerificationReminders(): Promise<{
  success: boolean
  sent: number
  errors: number
  message: string
}> {
  const supabase = await createClient()

  try {
    // Get unverified users who need reminders
    const { data: unverifiedUsers, error } = await supabase
      .rpc('get_unverified_users_for_reminders')

    if (error) {
      console.error('Error fetching unverified users:', error)
      return {
        success: false,
        sent: 0,
        errors: 1,
        message: `Failed to fetch unverified users: ${error.message}`
      }
    }

    if (!unverifiedUsers || unverifiedUsers.length === 0) {
      return {
        success: true,
        sent: 0,
        errors: 0,
        message: 'No users need verification reminders at this time'
      }
    }

    let sent = 0
    let errors = 0

    // Process each unverified user
    for (const user of unverifiedUsers) {
      try {
        // Generate fresh OTP for email confirmation
        const otpError = await sendOTPForEmailConfirmation(user.email, user.profile_id)

        if (otpError) {
          console.error(`Failed to send OTP to ${user.email}:`, otpError)
          errors++
          continue
        }

        // Determine which reminder this is (1st, 2nd, or 3rd)
        const reminderNumber = (user.reminder_count || 0) + 1
        const daysSinceSignup = Math.floor(
          (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
        )

        // Send reminder email
        const verifyUrl = `${process.env['NEXT_PUBLIC_SITE_URL']}/verify-otp?email=${encodeURIComponent(user.email)}&type=email_confirmation`

        await sendEmail({
          to: user.email,
          subject: getReminderSubject(reminderNumber),
          html: getReminderEmailHtml(verifyUrl, reminderNumber, daysSinceSignup),
          text: getReminderEmailText(verifyUrl, reminderNumber, daysSinceSignup)
        })

        // Record that reminder was sent
        const { error: recordError } = await supabase
          .rpc('record_verification_reminder_sent', {
            p_profile_id: user.profile_id,
            p_email: user.email
          })

        if (recordError) {
          console.error(`Failed to record reminder for ${user.email}:`, recordError)
          errors++
        } else {
          sent++
        }

      } catch (err) {
        console.error(`Error processing user ${user.email}:`, err)
        errors++
      }
    }

    return {
      success: true,
      sent,
      errors,
      message: `Sent ${sent} verification reminders, ${errors} errors`
    }

  } catch (err) {
    console.error('Unexpected error in sendVerificationReminders:', err)
    return {
      success: false,
      sent: 0,
      errors: 1,
      message: `Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }
  }
}

/**
 * Get email subject based on reminder number
 */
function getReminderSubject(reminderNumber: number): string {
  switch (reminderNumber) {
    case 1:
      return 'Please Verify Your Email Address'
    case 2:
      return 'Reminder: Verify Your Email to Access Your Account'
    case 3:
      return 'Final Reminder: Your Account Needs Email Verification'
    default:
      return 'Email Verification Required'
  }
}

/**
 * Generate HTML email body for verification reminder
 */
function getReminderEmailHtml(
  verifyUrl: string,
  reminderNumber: number,
  daysSinceSignup: number
): string {
  const urgencyMessage = reminderNumber === 3
    ? '<p style="color: #dc2626; font-weight: 600;">This is your final reminder. Unverified accounts may be removed after 14 days.</p>'
    : reminderNumber === 2
    ? '<p style="color: #ea580c;">Your account has been waiting for verification for several days.</p>'
    : ''

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Email Verification Reminder</title>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
    <h1 style="color: #111827; margin: 0 0 16px 0; font-size: 24px;">Email Verification Required</h1>
    ${urgencyMessage}
    <p style="margin: 16px 0;">
      You created an account ${daysSinceSignup} day${daysSinceSignup !== 1 ? 's' : ''} ago, but haven't verified your email address yet.
    </p>
    <p style="margin: 16px 0;">
      Please verify your email to access all features of your account.
    </p>
  </div>

  <div style="text-align: center; margin: 32px 0;">
    <a href="${verifyUrl}"
       style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 12px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">
      Verify Email Address
    </a>
  </div>

  <div style="background: #f3f4f6; border-left: 4px solid #6b7280; padding: 16px; margin: 24px 0;">
    <p style="margin: 0; font-size: 14px; color: #4b5563;">
      <strong>Note:</strong> If you didn't create this account, you can safely ignore this email.
    </p>
  </div>

  <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center;">
    <p>This is reminder ${reminderNumber} of 3.</p>
    <p>Having trouble? Contact us at support@zenithwebstudios.com</p>
  </div>
</body>
</html>
  `.trim()
}

/**
 * Generate plain text email body for verification reminder
 */
function getReminderEmailText(
  verifyUrl: string,
  reminderNumber: number,
  daysSinceSignup: number
): string {
  const urgencyMessage = reminderNumber === 3
    ? '\n⚠️ This is your final reminder. Unverified accounts may be removed after 14 days.\n'
    : reminderNumber === 2
    ? '\nYour account has been waiting for verification for several days.\n'
    : ''

  return `
Email Verification Required
${urgencyMessage}
You created an account ${daysSinceSignup} day${daysSinceSignup !== 1 ? 's' : ''} ago, but haven't verified your email address yet.

Please verify your email to access all features of your account.

Verify your email by clicking this link:
${verifyUrl}

Note: If you didn't create this account, you can safely ignore this email.

This is reminder ${reminderNumber} of 3.

Having trouble? Contact us at support@zenithwebstudios.com
  `.trim()
}
