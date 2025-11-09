'use client'

import { useCallback } from 'react'
import {
  toast as sonnerToast,
  type ExternalToast,
} from 'sonner'

type ToastVariant =
  | 'default'
  | 'destructive'
  | 'success'
  | 'warning'
  | 'info'

export interface ToastOptions
  extends Pick<ExternalToast, 'description' | 'duration' | 'action'> {
  title?: string
  variant?: ToastVariant
}

const variantDispatch: Record<
  ToastVariant,
  (message: string, data?: ExternalToast) => void
> = {
  default: (message, data) => {
    sonnerToast(message, data)
  },
  destructive: (message, data) => {
    sonnerToast.error(message, data)
  },
  success: (message, data) => {
    sonnerToast.success(message, data)
  },
  warning: (message, data) => {
    sonnerToast.warning(message, data)
  },
  info: (message, data) => {
    sonnerToast.info(message, data)
  },
}

export function useToast() {
  const toast = useCallback(
    ({ title = '', description, duration, action, variant = 'default' }: ToastOptions) => {
      const handler = variantDispatch[variant] ?? variantDispatch.default
      handler(title, {
        description,
        duration,
        action,
      })
    },
    []
  )

  return { toast }
}
