/**
 * Layout Components
 *
 * Organized layout components for different areas of the application:
 * - marketing/ - Public-facing marketing header and footer
 * - dashboard/ - Dashboard layout components (admin/client portals)
 * - shared/ - Components shared across multiple contexts
 *
 * Organization:
 * - components/layout/ = shared layout components across portals
 * - features/[portal]/layout/ = portal-specific layout components
 * - features/marketing/[page]/sections/ = marketing page sections
 */

// Marketing Layout Components
export { Header, Footer } from './marketing'

// Dashboard Layout Components
export * from './dashboard'

// Shared Components
export { UserMenu } from './shared'
