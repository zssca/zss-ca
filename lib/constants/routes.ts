export const ROUTES = {
  // Public routes
  HOME: '/',
  PRICING: '/pricing',
  ABOUT: '/about',
  CASE_STUDIES: '/case-studies',
  SERVICES: '/services',
  RESOURCES: '/resources',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',

  // Auth routes
  LOGIN: '/login',
  SIGNUP: '/signup',
  RESET_PASSWORD: '/reset-password',
  UPDATE_PASSWORD: '/update-password',
  VERIFY_OTP: '/verify-otp',
  AUTH_CALLBACK: '/callback',

  // Client portal routes
  CLIENT_DASHBOARD: '/client',
  CLIENT_SITES: '/client/sites',
  CLIENT_SUPPORT: '/client/support',
  CLIENT_SUPPORT_NEW: '/client/support/new',
  CLIENT_SUBSCRIPTION: '/client/subscription',
  CLIENT_PROFILE: '/client/profile',
  CLIENT_NOTIFICATIONS: '/client/notifications',

  // Admin portal routes
  ADMIN_DASHBOARD: '/admin',
  ADMIN_CLIENTS: '/admin/clients',
  ADMIN_SITES: '/admin/sites',
  ADMIN_SITES_NEW: '/admin/sites/new',
  ADMIN_SUPPORT: '/admin/support',
  ADMIN_LEADS: '/admin/leads',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_BILLING: '/admin/billing',
  ADMIN_NOTIFICATIONS: '/admin/notifications',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_PROFILE: '/admin/profile',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',
  ADMIN_DATABASE: '/admin/database',
} as const

export type RouteKey = keyof typeof ROUTES
export type RouteValue = typeof ROUTES[RouteKey]

/**
 * Type-safe route helpers for dynamic routes
 * Use these instead of string interpolation for better type safety and consistency
 */
export const ROUTE_HELPERS = {
  /** Generate admin client detail route: /admin/clients/[id] */
  adminClientDetail: (id: string): string => `/admin/clients/${id}`,

  /** Generate admin site detail route: /admin/sites/[id] */
  adminSiteDetail: (id: string): string => `/admin/sites/${id}`,

  /** Generate admin support ticket detail route: /admin/support/[id] */
  adminSupportDetail: (id: string): string => `/admin/support/${id}`,

  /** Generate client site detail route: /client/sites/[id] */
  clientSiteDetail: (id: string): string => `/client/sites/${id}`,

  /** Generate client support ticket detail route: /client/support/[id] */
  clientSupportDetail: (id: string): string => `/client/support/${id}`,
} as const
