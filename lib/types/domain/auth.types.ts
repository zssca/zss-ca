import type {
  AccountLockoutRow,
  LoginAttemptRow,
  OtpAttemptLogRow,
  OtpVerificationRow,
  ProfileRow,
  RateLimitViolationRow,
  VerificationReminderRow,
} from '../database-aliases'

/**
 * Authentication and security domain types
 */

export type AccountLockout = AccountLockoutRow
export type LoginAttempt = LoginAttemptRow
export type RateLimitViolation = RateLimitViolationRow
export type OtpAttemptLog = OtpAttemptLogRow
export type OtpVerification = OtpVerificationRow
export type VerificationReminder = VerificationReminderRow

/**
 * Authentication state and session management
 */
export interface AuthSession {
  user: ProfileRow
  accessToken: string
  refreshToken?: string
  expiresAt: number
}

/**
 * Login attempt summary with user context
 */
export interface LoginAttemptWithUser extends LoginAttemptRow {
  user?: ProfileRow | null
}

/**
 * Account lockout with context
 */
export interface AccountLockoutDetails extends AccountLockoutRow {
  lockedBy?: ProfileRow | null
  remainingLockDuration?: number // milliseconds
  canUnlock: boolean
}

/**
 * Rate limiting context
 */
export interface RateLimitContext {
  identifier: string // email, IP, etc.
  limit: number
  remaining: number
  resetAt: Date
  isExceeded: boolean
}

/**
 * OTP verification status
 */
export interface OtpVerificationStatus extends OtpVerificationRow {
  isExpired: boolean
  attemptsRemaining: number
}

/**
 * Security audit summary
 */
export interface SecurityAuditSummary {
  failedLogins: number
  accountLockouts: number
  rateLimitViolations: number
  otpAttempts: number
  suspiciousActivity: boolean
  period: string
}

/**
 * Verification reminder status
 */
export interface VerificationReminderStatus {
  email: string
  remindersSent: number
  lastReminderAt: string | null
  verified: boolean
  daysUntilExpiry?: number
}
