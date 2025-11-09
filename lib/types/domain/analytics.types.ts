import type {
  SiteAnalyticsRow,
  SiteAnalyticsEventRow,
  ClientSiteRow,
  SubscriptionRow,
} from '../database-aliases'

/**
 * Analytics and metrics domain types
 */

export type SiteAnalytics = SiteAnalyticsRow
export type SiteAnalyticsEvent = SiteAnalyticsEventRow

/**
 * Site analytics with context
 */
export interface SiteAnalyticsWithContext extends SiteAnalyticsRow {
  site: ClientSiteRow
  subscription?: SubscriptionRow | null
}

/**
 * Analytics event with metadata
 */
export interface AnalyticsEventDetail extends SiteAnalyticsEventRow {
  site: ClientSiteRow
  parsedPayload?: Record<string, unknown>
}

/**
 * Site performance metrics
 */
export interface SitePerformanceMetrics {
  siteId: string
  siteName: string
  pageViews: number
  uniqueVisitors: number
  averageSessionDuration: number
  bounceRate: number
  conversionRate?: number
  topPages: Array<{
    path: string
    views: number
    uniqueVisitors: number
  }>
  period: string
}

/**
 * Traffic source breakdown
 */
export interface TrafficSources {
  direct: number
  organic: number
  referral: number
  social: number
  paid: number
  other: number
}

/**
 * User behavior metrics
 */
export interface UserBehaviorMetrics {
  newUsers: number
  returningUsers: number
  avgPagesPerSession: number
  avgSessionDuration: number
  deviceBreakdown: {
    desktop: number
    mobile: number
    tablet: number
  }
  browserBreakdown: Record<string, number>
}

/**
 * Real-time analytics snapshot
 */
export interface RealTimeAnalytics {
  activeUsers: number
  activePages: Array<{
    path: string
    activeUsers: number
  }>
  recentEvents: SiteAnalyticsEventRow[]
  timestamp: string
}

/**
 * Analytics dashboard data
 */
export interface AnalyticsDashboard {
  overview: SitePerformanceMetrics
  trafficSources: TrafficSources
  userBehavior: UserBehaviorMetrics
  topEvents: SiteAnalyticsEventRow[]
  trends: Array<{
    date: string
    pageViews: number
    uniqueVisitors: number
  }>
}

/**
 * Analytics filter options
 */
export interface AnalyticsFilters {
  siteId?: string
  dateFrom?: string
  dateTo?: string
  eventType?: string
  deviceType?: 'desktop' | 'mobile' | 'tablet'
  country?: string
}
