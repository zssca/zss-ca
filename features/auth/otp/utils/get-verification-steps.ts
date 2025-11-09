'use client'

type VerificationType = 'password_reset' | 'email_confirmation' | 'two_factor'

export type VerificationStep = {
  label: string
  status: 'complete' | 'current' | 'upcoming'
}

export function getVerificationSteps(type: VerificationType): VerificationStep[] {
  if (type === 'password_reset') {
    return [
      { label: '1. Request Reset', status: 'complete' },
      { label: '2. Verify Code', status: 'current' },
      { label: '3. Update Password', status: 'upcoming' },
    ]
  }

  if (type === 'email_confirmation') {
    return [
      { label: '1. Create Account', status: 'complete' },
      { label: '2. Verify Email', status: 'current' },
      { label: '3. Get Started', status: 'upcoming' },
    ]
  }

  return [
    { label: '1. Sign In', status: 'complete' },
    { label: '2. Verify Code', status: 'current' },
    { label: '3. Access Account', status: 'upcoming' },
  ]
}
