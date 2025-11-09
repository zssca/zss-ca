'use client'

import { Eye, EyeOff } from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import { cn } from '@/lib/utils/index'

interface PasswordVisibilityToggleProps {
  pressed: boolean
  onPressedChange: (pressed: boolean) => void
  disabled?: boolean
  showLabel?: string
  hideLabel?: string
  className?: string
}

export function PasswordVisibilityToggle({
  pressed,
  onPressedChange,
  disabled = false,
  showLabel = 'Show password',
  hideLabel = 'Hide password',
  className,
}: PasswordVisibilityToggleProps): React.JSX.Element {
  return (
    <Toggle
      type="button"
      pressed={pressed}
      onPressedChange={onPressedChange}
      variant="default"
      size="sm"
      className={cn('size-8 rounded-md', className)}
      aria-label={pressed ? hideLabel : showLabel}
      disabled={disabled}
    >
      {pressed ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
    </Toggle>
  )
}
