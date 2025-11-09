'use client'

import { startTransition, useActionState, useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { loginAction } from '../api/mutations'
import { AuthFormAnnouncements } from '@/features/auth/components/auth-form-announcements'
import { useFocusFirstError } from '@/features/auth/hooks/use-focus-first-error'
import { useFaviconPending } from '@/features/auth/hooks/use-favicon-pending'
import { LoginFormView } from './login-form-view'
import { ROUTES } from '@/lib/constants/routes'

type LoginFormState = {
  error?: string | null
  fieldErrors?: Record<string, string[]>
} | null

export function LoginForm(): React.JSX.Element {
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [passwordAnnouncement, setPasswordAnnouncement] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [rateLimitState, setRateLimitState] = useState<{
    remaining: number
    total: number
    startedAt: number
  } | null>(null)
  const [state, formAction, isPending] = useActionState(loginAction, null)

  const handleSubmit = useCallback(async (formData: FormData) => {
    await formAction(formData)
  }, [formAction])

  useEffect(() => {
    const match = state?.error?.match(/(\d+)\s+seconds/)
    startTransition(() => {
      if (match) {
        const seconds = Number(match[1])
        setRateLimitState({
          remaining: seconds,
          total: seconds,
          startedAt: Date.now(),
        })
      } else if (state) {
        setRateLimitState(null)
      }
    })
  }, [state])

  useEffect(() => {
    if (!rateLimitState) {
      return
    }

    const interval = window.setInterval(() => {
      setRateLimitState((previous) => {
        if (!previous) {
          return previous
        }

        const elapsedSeconds = Math.floor((Date.now() - previous.startedAt) / 1000)
        const remaining = previous.total - elapsedSeconds

        if (remaining > 0) {
          if (remaining === previous.remaining) {
            return previous
          }
          return { ...previous, remaining }
        }

        return null
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [rateLimitState])

  const remainingRateLimitSeconds = rateLimitState?.remaining ?? null

  const reason = searchParams.get('reason')
  const redirect = searchParams.get('redirect')

  const infoMessage = useMemo(() => {
    switch (reason) {
      case 'session_expired':
        return 'Your session has expired. Please sign in again to continue.'
      case 'unauthorized':
        return 'Please sign in to access this page.'
      case 'password_updated':
        return 'Your password has been updated successfully. Please sign in with your new password.'
      default:
        return redirect ? 'Please sign in to continue to your requested page.' : null
    }
  }, [reason, redirect])

  useFocusFirstError(state?.fieldErrors ?? null)
  useFaviconPending(isPending)

  useEffect(() => {
    if (!infoMessage) {
      return
    }

    if (reason === 'password_updated') {
      toast.success(infoMessage)
    } else if (reason === 'session_expired') {
      toast.warning(infoMessage)
    } else {
      toast.info(infoMessage)
    }
  }, [infoMessage, reason])

  useEffect(() => {
    if (!passwordAnnouncement) {
      return
    }

    const timer = window.setTimeout(() => setPasswordAnnouncement(null), 1500)
    return () => window.clearTimeout(timer)
  }, [passwordAnnouncement])

  const isRateLimited = Boolean(rateLimitState && rateLimitState.remaining > 0)
  const rateLimitProgress = rateLimitState && rateLimitState.total > 0
    ? ((rateLimitState.total - rateLimitState.remaining) / rateLimitState.total) * 100
    : 0

  const announcements = [
    isPending && 'Signing in, please wait',
    !isPending && state?.error,
    !isPending && infoMessage,
    isRateLimited && remainingRateLimitSeconds !== null && `Account temporarily locked. ${remainingRateLimitSeconds} seconds remaining`,
    passwordAnnouncement,
  ]

  return (
    <div className="flex flex-col items-center gap-6">
      <AuthFormAnnouncements messages={announcements} />

      <LoginFormView
        state={state as LoginFormState}
        isPending={isPending}
        isRateLimited={isRateLimited}
        remainingRateLimitSeconds={remainingRateLimitSeconds}
        rateLimitProgress={rateLimitProgress}
        rememberMe={rememberMe}
        onRememberChange={(checked) => setRememberMe(checked)}
        showPassword={showPassword}
        onTogglePassword={(next) => {
          setShowPassword(next)
          setPasswordAnnouncement(next ? 'Password is now visible' : 'Password is now hidden')
        }}
        formAction={handleSubmit}
        infoMessage={infoMessage}
        emailError={emailError}
        onEmailErrorChange={setEmailError}
      />

      <p className="text-center text-sm text-muted-foreground">
        By signing in you agree to our{' '}
        <Link href={ROUTES.PRIVACY}>Privacy Policy</Link>{' '}
        and{' '}
        <Link href={ROUTES.TERMS}>Terms of Service</Link>.
      </p>
    </div>
  )
}
