import type { Metadata } from 'next'
import { ResetPasswordPageFeature } from '@/features/auth'
export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your password',
  robots: {
    index: false,
    follow: false,
  },
}
export const dynamic = 'force-static'
export const revalidate = 3600
export default function ResetPasswordPage() {
  return <ResetPasswordPageFeature />
}
