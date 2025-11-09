import * as React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// ============================================================================
// Type Definitions
// ============================================================================

type Size = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
type MaxWidth = Size | 'default' | 'full'
type Padding = Size | 'default'
type Gap = Size | 'default'
type HeaderMaxWidth = Extract<Size, 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'>
type Background = 'default' | 'muted' | 'accent' | 'card' | 'primary' | 'secondary'
type Border = 'none' | 'top' | 'bottom' | 'both'
type HeadingLevel = 'h1' | 'h2' | 'h3'
type TextAlign = 'left' | 'center' | 'right'
type Separator = 'top' | 'bottom' | 'both' | 'none'
type Variant = 'default' | 'elevated' | 'bordered'

export interface SectionHeaderProps {
  /** Badge text displayed above heading */
  badge?: string
  /** Main section heading */
  heading?: string
  /** Section description text */
  description?: string
  /** Semantic heading level */
  headingLevel: HeadingLevel
  /** Text alignment */
  textAlign: TextAlign
  /** Maximum width constraint */
  maxWidth: HeaderMaxWidth
}

export interface SectionContainerProps extends Omit<React.ComponentPropsWithoutRef<'section'>, 'title'> {
  /** Container width constraint @default 'default' (max-w-7xl) */
  maxWidth?: MaxWidth
  /** Padding preset @default 'default' (py-16 px-4 sm:px-6 lg:px-8) */
  padding?: Padding
  /** Remove horizontal padding on mobile @default false */
  mobileEdgeToEdge?: boolean
  /** Background color variant @default 'default' */
  background?: Background
  /** Border placement @default 'none' */
  border?: Border
  /** Enable rounded corners @default false */
  rounded?: boolean
  /** Optional badge text above heading */
  badge?: string
  /** Optional section heading */
  heading?: string
  /** Optional section description */
  description?: string
  /** Heading level for semantic HTML @default 'h2' */
  headingLevel?: HeadingLevel
  /** Text alignment for header @default 'center' */
  textAlign?: TextAlign
  /** Max width for header content @default '3xl' */
  headerMaxWidth?: HeaderMaxWidth
  /** Gap between header and content @default 'lg' */
  gap?: Gap
  /** Separator placement @default 'none' */
  separator?: Separator
  /** Visual variant @default 'default' */
  variant?: Variant
}

// ============================================================================
// Style Configuration Maps
// ============================================================================

/**
 * Consistent spacing scale following Tailwind conventions
 * Scale: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80
 */

const MAX_WIDTH_MAP = {
  none: 'max-w-none',
  xs: 'max-w-xs',
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
} as const satisfies Record<MaxWidth, string>

const PADDING_MAP = {
  none: 'py-0',
  xs: 'py-4 px-4 sm:px-6 lg:px-8',
  sm: 'py-8 px-4 sm:px-6 lg:px-8',
  md: 'py-12 px-4 sm:px-6 lg:px-8',
  lg: 'py-16 px-4 sm:px-6 lg:px-8',
  xl: 'py-20 px-4 sm:px-6 lg:px-8',
  '2xl': 'py-24 px-4 sm:px-6 lg:px-8',
  '3xl': 'py-32 px-4 sm:px-6 lg:px-8',
  '4xl': 'py-40 px-4 sm:px-6 lg:px-8',
  '5xl': 'py-48 px-4 sm:px-6 lg:px-8',
  '6xl': 'py-64 px-4 sm:px-6 lg:px-8',
  '7xl': 'py-80 px-4 sm:px-6 lg:px-8',
  default: 'py-16 px-4 sm:px-6 lg:px-8',
} as const satisfies Record<Padding, string>

const GAP_MAP = {
  none: 'gap-0',
  xs: 'gap-4',
  sm: 'gap-8',
  md: 'gap-12',
  lg: 'gap-16',
  xl: 'gap-20',
  '2xl': 'gap-24',
  '3xl': 'gap-32',
  '4xl': 'gap-40',
  '5xl': 'gap-48',
  '6xl': 'gap-64',
  '7xl': 'gap-80',
  default: 'gap-16',
} as const satisfies Record<Gap, string>

const HEADER_WIDTH_MAP = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
} as const satisfies Record<HeaderMaxWidth, string>

const BACKGROUND_MAP = {
  default: '',
  muted: 'bg-muted/50',
  accent: 'bg-accent',
  card: 'bg-card',
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
} as const satisfies Record<Background, string>

const BORDER_MAP = {
  none: '',
  top: 'border-t',
  bottom: 'border-b',
  both: 'border-y',
} as const satisfies Record<Border, string>

const ALIGNMENT_MAP = {
  left: 'items-start text-left ml-0',
  center: 'items-center text-center mx-auto',
  right: 'items-end text-right ml-auto',
} as const satisfies Record<TextAlign, string>

const VARIANT_MAP = {
  default: '',
  elevated: 'shadow-sm',
  bordered: 'border',
} as const satisfies Record<Variant, string>

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * SectionHeader - Header content for sections
 *
 * Renders badge, heading, and description with proper semantic HTML
 * and accessibility. Extracted for Single Responsibility Principle.
 */
function SectionHeader({
  badge,
  heading,
  description,
  headingLevel,
  textAlign,
  maxWidth,
}: SectionHeaderProps) {
  const HeadingTag = headingLevel

  const headerClasses = cn(
    'flex flex-col gap-4 w-full',
    ALIGNMENT_MAP[textAlign],
    HEADER_WIDTH_MAP[maxWidth]
  )

  return (
    <header className={headerClasses}>
      {badge && (
        <Badge variant="outline" className="w-fit">
          {badge}
        </Badge>
      )}

      {heading && (
        <HeadingTag className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">
          {heading}
        </HeadingTag>
      )}

      {description && (
        <p className="text-base text-muted-foreground sm:text-lg leading-7">
          {description}
        </p>
      )}
    </header>
  )
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * SectionContainer - Semantic section wrapper with consistent layout
 *
 * A flexible, accessible section component that provides:
 * - Semantic HTML5 section element
 * - Responsive max-width constraint
 * - Consistent padding and spacing
 * - Optional header with badge, heading, and description
 * - Theming support via background and variant props
 * - Mobile-first responsive design
 *
 * @example
 * ```tsx
 * // Simple usage
 * <SectionContainer>
 *   <YourContent />
 * </SectionContainer>
 * ```
 *
 * @example
 * ```tsx
 * // With header
 * <SectionContainer
 *   badge="Features"
 *   heading="Everything you need"
 *   description="All the tools to grow your business"
 * >
 *   <FeatureGrid />
 * </SectionContainer>
 * ```
 *
 * @example
 * ```tsx
 * // With styling
 * <SectionContainer
 *   background="muted"
 *   border="both"
 *   padding="mobile-full"
 * >
 *   <Content />
 * </SectionContainer>
 * ```
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
  // ========================================================================
  // Computed Values
  // ========================================================================

  const hasHeader = Boolean(badge || heading || description)
  const shouldShowTopSeparator = separator === 'top' || separator === 'both'
  const shouldShowBottomSeparator = separator === 'bottom' || separator === 'both'

  // ========================================================================
  // Style Composition
  // ========================================================================

  const sectionClasses = cn(
    'w-full',
    BACKGROUND_MAP[background],
    BORDER_MAP[border],
    VARIANT_MAP[variant],
    className
  )

  const containerClasses = cn(
    'mx-auto w-full',
    MAX_WIDTH_MAP[maxWidth],
    PADDING_MAP[padding],
    mobileEdgeToEdge && 'px-0',
    rounded && 'rounded-lg'
  )

  const stackClasses = cn(
    'flex flex-col',
    hasHeader && GAP_MAP[gap]
  )

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <section className={sectionClasses} {...props}>
      <div className={containerClasses}>
        <div className={stackClasses}>
          {shouldShowTopSeparator && <Separator />}

          {hasHeader && (
            <SectionHeader
              badge={badge}
              heading={heading}
              description={description}
              headingLevel={headingLevel}
              textAlign={textAlign}
              maxWidth={headerMaxWidth}
            />
          )}

          {children}

          {shouldShowBottomSeparator && <Separator />}
        </div>
      </div>
    </section>
  )
}
