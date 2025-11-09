import { Suspense } from 'react'
import type { Metadata } from 'next'
import { OTPVerificationForm } from '@/features/auth'
export const metadata: Metadata = {
  title: 'Verify Code',
  description: 'Enter your verification code',
  robots: { index: false, follow: false },
}
export const dynamic = 'force-static'
export const revalidate = 3600
export default function VerifyOTPPage() {
  return <Suspense fallback={null}><OTPVerificationForm /></Suspense>
}
