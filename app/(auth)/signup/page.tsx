import type { Metadata } from 'next'
import { SignupPageFeature } from '@/features/auth'
export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a new account',
  robots: {
    index: false,
    follow: false,
  },
}
export const dynamic = 'force-static'
export const revalidate = 3600
export default function SignupPage() {
  return <SignupPageFeature />
}
