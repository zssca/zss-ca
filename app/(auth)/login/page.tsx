import type { Metadata } from 'next'
import { LoginPageFeature } from '@/features/auth'
export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your account',
  robots: {
    index: false,
    follow: false,
  },
}
export const dynamic = 'force-static'
export const revalidate = 3600
export default function LoginPage() {
  return <LoginPageFeature />
}
