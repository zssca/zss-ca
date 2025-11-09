export interface EmailRecipient {
  name?: string
  email: string
}

export interface EmailAttachment {
  filename: string
  content: string | ArrayBuffer
  mimeType: string
}

export interface EmailPayload {
  to: EmailRecipient | EmailRecipient[]
  cc?: EmailRecipient[]
  bcc?: EmailRecipient[]
  replyTo?: EmailRecipient
  subject: string
  text?: string
  html: string
  attachments?: EmailAttachment[]
  headers?: Record<string, string>
}

export interface TemplateEmailPayload<
  TemplateVars extends Record<string, unknown> = Record<string, unknown>,
> {
  to: EmailRecipient | EmailRecipient[]
  templateId: string
  variables: TemplateVars
  cc?: EmailRecipient[]
  bcc?: EmailRecipient[]
}

export interface EmailSendResult {
  id: string
  queued: boolean
  error?: string
  metadata?: Record<string, unknown>
}
