import type {
  PlanRow,
  ProfileRow,
  SubscriptionRow,
} from '../database-aliases'

export type Profile = ProfileRow

export interface ProfilePreferences {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  notifications?: {
    email: boolean
    sms: boolean
    push: boolean
  }
  timezone?: string
}

export interface ProfileWithSubscription extends ProfileRow {
  subscription?: SubscriptionRow | null
  plan?: PlanRow | null
  preferences?: ProfilePreferences
}
