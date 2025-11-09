import * as React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export interface SectionContainerProps extends Omit<React.ComponentPropsWithoutRef<'section'>, 'title'> {
  /**
   * Optional container width constraint
   * @default 'default' (max-w-7xl)
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'default' | 'full'
  /**
   * Optional padding override
   * @default 'default' (py-16 px-4 sm:px-6 lg:px-8)
   */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'default' | 'mobile-full'
  /**
   * Remove horizontal padding on mobile viewports
   * while preserving spacing on larger breakpoints.
   * @default false
   */
  mobileEdgeToEdge?: boolean
  /**
   * Background color variant
   * @default 'default' (transparent)
   */
  background?: 'default' | 'muted' | 'accent' | 'card' | 'primary' | 'secondary'
  /**
   * Border placement
   * @default 'none'
   */
  border?: 'none' | 'top' | 'bottom' | 'both'
  /**
   * Enable rounded corners
   * @default false
   */
  rounded?: boolean
  /**
   * Optional badge text above heading
   */
  badge?: string
  /**
   * Optional section heading
   */
  heading?: string
  /**
   * Optional section description
   */
  description?: string
  /**
   * Heading level for semantic HTML
   * @default 'h2'
   */
  headingLevel?: 'h1' | 'h2' | 'h3'
  /**
   * Text alignment for header
   * @default 'center'
   */
  textAlign?: 'left' | 'center' | 'right'
  /**
   * Max width for header content
   * @default '3xl'
   */
  headerMaxWidth?: '2xl' | '3xl' | '4xl' | '5xl'
  /**
   * Gap between header and content
   * @default 'lg'
   */
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  /**
   * Separator placement
   * @default 'none'
   */
  separator?: 'top' | 'bottom' | 'both' | 'none'
  /**
   * Visual variant
   * @default 'default'
   */
  variant?: 'default' | 'elevated' | 'bordered'
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  default: 'max-w-7xl',
  full: 'max-w-full',
}

const paddingClasses = {
  none: 'py-0',
  sm: 'py-8 px-4 sm:px-6 lg:px-8',
  md: 'py-12 px-4 sm:px-6 lg:px-8',
  lg: 'py-20 px-4 sm:px-6 lg:px-8',
  xl: 'py-24 px-4 sm:px-6 lg:px-8',
  default: 'py-16 px-4 sm:px-6 lg:px-8',
  'mobile-full': 'py-16 px-0 sm:px-6 lg:px-8',
}

const backgroundClasses = {
  default: '',
  muted: 'bg-muted/50',
  accent: 'bg-accent',
  card: 'bg-card',
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
}

const borderClasses = {
  none: '',
  top: 'border-t',
  bottom: 'border-b',
  both: 'border-y',
}

const headerAlignmentClasses = {
  left: 'items-start text-left ml-0',
  center: 'items-center text-center mx-auto',
  right: 'items-end text-right ml-auto',
}

const headerMaxWidthClasses = {
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
}

const gapClasses = {
  sm: 'gap-8',
  md: 'gap-12',
  lg: 'gap-16',
  xl: 'gap-20',
}

const variantClasses = {
  default: '',
  elevated: 'shadow-sm',
  bordered: 'border',
}

/**
 * Section Container Component
 *
 * Full-width semantic section wrapper with max-w-7xl content constraint.
 * Provides consistent spacing, theming, and optional section headers.
 *
 * @example
 * // Simple usage
 * <SectionContainer>
 *   <YourContent />
 * </SectionContainer>
 *
 * @example
 * // With header
 * <SectionContainer
 *   badge="Features"
 *   heading="Everything you need"
 *   description="All the tools to grow your business"
 * >
 *   <FeatureGrid />
 * </SectionContainer>
 *
 * @example
 * // With styling
 * <SectionContainer
 *   background="muted"
 *   border="both"
 *   padding="mobile-full"
 * >
 *   <Content />
 * </SectionContainer>
 */
export function SectionContainer({
  className,
  maxWidth = 'default',
  padding = 'default',
  mobileEdgeToEdge = false,
  background = 'default',
  border = 'none',
  rounded = false,
  badge,
  heading,
  description,
  headingLevel = 'h2',
  textAlign = 'center',
  headerMaxWidth = '3xl',
  gap = 'lg',
  separator = 'none',
  variant = 'default',
  children,
  ...props
}: SectionContainerProps) {
  const HeadingTag = headingLevel
  const hasHeader = badge || heading || description
  const showTopSeparator = separator === 'top' || separator === 'both'
  const showBottomSeparator = separator === 'bottom' || separator === 'both'

  const sectionClasses = cn(
    'w-full',
    backgroundClasses[background],
    borderClasses[border],
    variantClasses[variant],
    className
  )

  const containerClasses = cn(
    'mx-auto w-full',
    maxWidthClasses[maxWidth],
    paddingClasses[padding],
    mobileEdgeToEdge && 'px-0',
    rounded && 'rounded-lg'
  )

  const stackClasses = cn('flex flex-col', hasHeader && gapClasses[gap])

  const headerClasses = cn(
    'flex flex-col gap-4 w-full',
    headerAlignmentClasses[textAlign],
    headerMaxWidthClasses[headerMaxWidth]
  )

  return (
    <section className={sectionClasses} {...props}>
      <div className={containerClasses}>
        <div className={stackClasses}>
          {hasHeader && (
            <>
              {showTopSeparator ? <Separator /> : null}
              <div className={headerClasses}>
                {badge && <Badge variant="outline" className="w-fit">{badge}</Badge>}
                {heading && (
                  <HeadingTag className="text-3xl font-bold tracking-tight sm:text-4xl">
                    {heading}
                  </HeadingTag>
                )}
                {description && (
                  <p className="text-base text-muted-foreground sm:text-lg">{description}</p>
                )}
              </div>
            </>
          )}
          {children}
          {showBottomSeparator ? <Separator /> : null}
        </div>
      </div>
    </section>
  )
}
