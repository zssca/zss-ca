import 'server-only'

import { resend } from './client'
import * as templates from './templates'
import * as leadTemplates from './lead-templates'
import { siteConfig } from '../config/site.config'

const FROM_EMAIL = process.env['RESEND_FROM_EMAIL'] || 'noreply@example.com'
const ADMIN_EMAIL = process.env['ADMIN_EMAIL'] || 'admin@zenithsites.ca'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  // Check if RESEND_API_KEY is configured
  if (!process.env['RESEND_API_KEY']) {
    console.warn('RESEND_API_KEY not configured - email not sent')
    // In development, return success with mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Mock email sent:', { to, subject })
      return { success: true, data: { id: 'mock-email-id' } }
    }
    return { success: false, error: 'RESEND_API_KEY not configured' }
  }

  try {
    const data = await resend.emails.send({
      from: `${siteConfig.name} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      text,
    })

    return { success: true, data }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}

export async function sendWelcomeEmail(to: string, name: string): Promise<{ success: boolean; data?: unknown; error?: unknown }> {
  const template = templates.welcomeEmail(name)
  return sendEmail({ to, ...template })
}

export async function sendSubscriptionCreatedEmail(
  to: string,
  name: string,
  planName: string,
  amount: number
) {
  const template = templates.subscriptionCreatedEmail(name, planName, amount)
  return sendEmail({ to, ...template })
}

export async function sendSubscriptionCanceledEmail(
  to: string,
  name: string,
  planName: string
) {
  const template = templates.subscriptionCanceledEmail(name, planName)
  return sendEmail({ to, ...template })
}

export async function sendSupportTicketCreatedEmail(
  to: string,
  name: string,
  ticketId: string,
  subject: string
) {
  const template = templates.supportTicketCreatedEmail(name, ticketId, subject)
  return sendEmail({ to, ...template })
}

export async function sendSupportTicketReplyEmail(
  to: string,
  name: string,
  ticketId: string,
  subject: string,
  replyMessage: string
) {
  const template = templates.supportTicketReplyEmail(name, ticketId, subject, replyMessage)
  return sendEmail({ to, ...template })
}

export async function sendSiteDeployedEmail(
  to: string,
  name: string,
  siteName: string,
  siteUrl: string
) {
  const template = templates.siteDeployedEmail(name, siteName, siteUrl)
  return sendEmail({ to, ...template })
}

export async function sendSiteStatusChangedEmail(
  to: string,
  name: string,
  siteName: string,
  oldStatus: string,
  newStatus: string
) {
  const template = templates.siteStatusChangedEmail(name, siteName, oldStatus, newStatus)
  return sendEmail({ to, ...template })
}

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<{ success: boolean; data?: unknown; error?: unknown }> {
  const template = templates.passwordResetEmail(name, resetUrl)
  return sendEmail({ to, ...template })
}

export async function sendOTPEmail(
  to: string,
  subject: string,
  otpCode: string,
  message: string
): Promise<boolean> {
  const template = templates.otpEmail(otpCode, message, subject)
  const result = await sendEmail({ to, ...template })
  return result.success
}

export async function sendNewLeadNotification(leadData: {
  fullName: string
  email: string
  companyName?: string
  phone?: string
  serviceInterest: string
  message: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}): Promise<{ success: boolean; data?: unknown; error?: unknown }> {
  const template = leadTemplates.newLeadNotificationEmail(leadData)
  return sendEmail({ to: ADMIN_EMAIL, ...template })
}

export async function sendLeadConfirmation(
  to: string,
  leadName: string
): Promise<{ success: boolean; data?: unknown; error?: unknown }> {
  const template = leadTemplates.leadConfirmationEmail(leadName)
  return sendEmail({ to, ...template })
}
