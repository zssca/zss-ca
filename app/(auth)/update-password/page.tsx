import type { Metadata } from 'next'
import { UpdatePasswordPageFeature } from '@/features/auth'
export const metadata: Metadata = {
  title: 'Update Password',
  description: 'Set your new password',
  robots: {
    index: false,
    follow: false,
  },
}
export const dynamic = 'force-static'
export const revalidate = 3600
export default function UpdatePasswordPage() {
  return <UpdatePasswordPageFeature />
}
