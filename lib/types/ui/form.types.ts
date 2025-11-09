import type { ReactNode } from 'react'

export interface FormFieldOption<TValue = string> {
  label: ReactNode
  value: TValue
  description?: ReactNode
  badge?: ReactNode
}

export interface FormFieldConfig<TValue = string> {
  name: string
  label: ReactNode
  description?: ReactNode
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: FormFieldOption<TValue>[]
  type?:
    | 'text'
    | 'textarea'
    | 'number'
    | 'select'
    | 'radio'
    | 'checkbox'
    | 'switch'
    | 'file'
    | 'date'
  inputMode?:
    | 'none'
    | 'text'
    | 'tel'
    | 'url'
    | 'email'
    | 'numeric'
    | 'decimal'
    | 'search'
  pattern?: string
  min?: number
  max?: number
  step?: number
}

export interface FormSectionConfig {
  id: string
  title: ReactNode
  description?: ReactNode
  fields: FormFieldConfig[]
}

export interface FormActionState<TState = Record<string, unknown>> {
  isPending: boolean
  lastUpdatedAt?: string
  errors?: Record<string, string[]>
  state?: TState
}
