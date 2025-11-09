import * as React from 'react'
import { cn } from '@/lib/utils'

// ============================================================================
// Type Definitions
// ============================================================================

export interface ContainerProps extends React.ComponentPropsWithoutRef<'div'> {
  /**
   * Apply horizontal padding only on sm+ breakpoints
   * @default false
   */
  constrained?: boolean
  /**
   * Maximum width constraint
   * @default '7xl'
   */
  maxWidth?: '7xl' | 'xl' | '2xl'
  /**
   * Enable as <main> element instead of <div>
   * @default false
   */
  asMain?: boolean
}

// ============================================================================
// Component
// ============================================================================

/**
 * Container - Responsive content wrapper with max-width constraints
 *
 * Provides consistent horizontal spacing and max-width across the application.
 * Follows Next.js 15+ and Tailwind CSS v4 best practices.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Container>
 *   <YourContent />
 * </Container>
 * ```
 *
 * @example
 * ```tsx
 * // Constrained padding (mobile full-width)
 * <Container constrained>
 *   <YourContent />
 * </Container>
 * ```
 *
 * @example
 * ```tsx
 * // As main element
 * <Container asMain maxWidth="xl">
 *   <YourContent />
 * </Container>
 * ```
 */
export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, constrained = false, maxWidth = '7xl', asMain = false, ...props }, ref) => {
    const Component = asMain ? 'main' : 'div'

    const maxWidthClasses = {
      xl: 'xl:max-w-screen-xl',
      '2xl': '2xl:max-w-screen-2xl',
      '7xl': 'max-w-7xl',
    }

    return (
      <Component
        ref={ref}
        className={cn(
          'mx-auto w-full',
          maxWidthClasses[maxWidth],
          constrained ? 'sm:px-4 md:px-6 lg:px-8' : 'px-4 sm:px-6 lg:px-8',
          className
        )}
        {...props}
      />
    )
  }
)

Container.displayName = 'Container'
