import type { Metadata } from 'next'
import { ResendVerificationPageFeature } from '@/features/auth'
export const metadata: Metadata = {
  title: 'Resend Verification Email',
  description: 'Request a new email verification code',
}
export default function ResendVerificationPage() {
  return <ResendVerificationPageFeature />
}
