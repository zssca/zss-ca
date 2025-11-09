import 'server-only'

interface LeadData {
  fullName: string
  email: string
  companyName?: string
  phone?: string
  serviceInterest: string
  message: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export function newLeadNotificationEmail(lead: LeadData) {
  const serviceLabels: Record<string, string> = {
    website_build: 'Website Build',
    consultation: 'Consultation',
    support: 'Support',
    other: 'Other',
  }

  const serviceLabel = serviceLabels[lead.serviceInterest] || lead.serviceInterest

  const subject = `New Lead: ${lead.fullName} - ${serviceLabel}`

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Lead Notification</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          <h1 style="color: #2563eb; margin-top: 0;">New Lead Submission</h1>
          <p style="color: #64748b; margin-bottom: 0;">You have received a new contact form submission.</p>
        </div>

        <div style="background-color: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #1e293b; margin-top: 0; font-size: 18px;">Contact Information</h2>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 140px;"><strong>Name:</strong></td>
              <td style="padding: 8px 0;">${lead.fullName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;"><strong>Email:</strong></td>
              <td style="padding: 8px 0;"><a href="mailto:${lead.email}" style="color: #2563eb; text-decoration: none;">${lead.email}</a></td>
            </tr>
            ${
              lead.companyName
                ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b;"><strong>Company:</strong></td>
              <td style="padding: 8px 0;">${lead.companyName}</td>
            </tr>
            `
                : ''
            }
            ${
              lead.phone
                ? `
            <tr>
              <td style="padding: 8px 0; color: #64748b;"><strong>Phone:</strong></td>
              <td style="padding: 8px 0;"><a href="tel:${lead.phone}" style="color: #2563eb; text-decoration: none;">${lead.phone}</a></td>
            </tr>
            `
                : ''
            }
            <tr>
              <td style="padding: 8px 0; color: #64748b;"><strong>Service Interest:</strong></td>
              <td style="padding: 8px 0;"><span style="background-color: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-size: 14px;">${serviceLabel}</span></td>
            </tr>
          </table>
        </div>

        <div style="background-color: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          <h2 style="color: #1e293b; margin-top: 0; font-size: 18px;">Message</h2>
          <p style="margin: 0; white-space: pre-wrap;">${lead.message}</p>
        </div>

        ${
          lead.utmSource || lead.utmMedium || lead.utmCampaign
            ? `
        <div style="background-color: #fefce8; border: 1px solid #fde047; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h3 style="color: #854d0e; margin-top: 0; font-size: 14px;">Attribution Data</h3>
          <ul style="margin: 0; padding-left: 20px; color: #713f12;">
            ${lead.utmSource ? `<li><strong>Source:</strong> ${lead.utmSource}</li>` : ''}
            ${lead.utmMedium ? `<li><strong>Medium:</strong> ${lead.utmMedium}</li>` : ''}
            ${lead.utmCampaign ? `<li><strong>Campaign:</strong> ${lead.utmCampaign}</li>` : ''}
          </ul>
        </div>
        `
            : ''
        }

        <div style="text-align: center; margin-top: 32px;">
          <a href="${process.env['NEXT_PUBLIC_APP_URL']}/admin/leads"
             style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
            View in Admin Dashboard
          </a>
        </div>

        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
          <p>This is an automated notification from your Zenith Sites platform.</p>
        </div>
      </body>
    </html>
  `

  const text = `
New Lead Submission

Contact Information:
- Name: ${lead.fullName}
- Email: ${lead.email}
${lead.companyName ? `- Company: ${lead.companyName}` : ''}
${lead.phone ? `- Phone: ${lead.phone}` : ''}
- Service Interest: ${serviceLabel}

Message:
${lead.message}

${
  lead.utmSource || lead.utmMedium || lead.utmCampaign
    ? `
Attribution Data:
${lead.utmSource ? `- Source: ${lead.utmSource}` : ''}
${lead.utmMedium ? `- Medium: ${lead.utmMedium}` : ''}
${lead.utmCampaign ? `- Campaign: ${lead.utmCampaign}` : ''}
`
    : ''
}

View in Admin Dashboard: ${process.env['NEXT_PUBLIC_APP_URL']}/admin/leads
  `.trim()

  return { subject, html, text }
}

export function leadConfirmationEmail(leadName: string) {
  const subject = 'Thank you for contacting Zenith Sites'

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; margin-bottom: 24px; text-align: center;">
          <h1 style="color: #2563eb; margin-top: 0;">Thank You, ${leadName}!</h1>
          <p style="color: #64748b; font-size: 18px; margin-bottom: 0;">We've received your message.</p>
        </div>

        <div style="background-color: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          <p style="margin-top: 0;">Thank you for reaching out to Zenith Sites. We appreciate your interest in our services.</p>

          <p>Our team will review your message and get back to you within 1-2 business days. If your inquiry is urgent, please feel free to call us directly.</p>

          <p style="margin-bottom: 0;">In the meantime, feel free to explore our:</p>
          <ul style="margin-top: 8px;">
            <li><a href="${process.env['NEXT_PUBLIC_APP_URL']}/case-studies" style="color: #2563eb;">Case Studies</a> - See our recent work</li>
            <li><a href="${process.env['NEXT_PUBLIC_APP_URL']}/resources" style="color: #2563eb;">Resources</a> - Helpful guides and tips</li>
            <li><a href="${process.env['NEXT_PUBLIC_APP_URL']}/pricing" style="color: #2563eb;">Pricing</a> - View our plans and pricing</li>
          </ul>
        </div>

        <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
          <p style="margin: 0; color: #1e40af; font-weight: 600;">Have questions? We're here to help!</p>
          <p style="margin: 8px 0 0 0; color: #3b82f6;">
            <a href="mailto:support@zenithsites.ca" style="color: #2563eb; text-decoration: none;">support@zenithsites.ca</a>
          </p>
        </div>

        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 14px;">
          <p>Best regards,<br>The Zenith Sites Team</p>
        </div>
      </body>
    </html>
  `

  const text = `
Thank You, ${leadName}!

We've received your message.

Thank you for reaching out to Zenith Sites. We appreciate your interest in our services.

Our team will review your message and get back to you within 1-2 business days. If your inquiry is urgent, please feel free to call us directly.

In the meantime, feel free to explore our:
- Case Studies: ${process.env['NEXT_PUBLIC_APP_URL']}/case-studies
- Resources: ${process.env['NEXT_PUBLIC_APP_URL']}/resources
- Pricing: ${process.env['NEXT_PUBLIC_APP_URL']}/pricing

Have questions? We're here to help!
Email: support@zenithsites.ca

Best regards,
The Zenith Sites Team
  `.trim()

  return { subject, html, text }
}
