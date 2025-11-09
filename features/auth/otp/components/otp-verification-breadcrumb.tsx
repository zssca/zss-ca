'use client'

import { Fragment } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { cn } from '@/lib/utils'
import type { VerificationStep } from '../utils/get-verification-steps'

interface OTPVerificationBreadcrumbProps {
  steps: VerificationStep[]
}

export function OTPVerificationBreadcrumb({ steps }: OTPVerificationBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {steps.map((step, index) => (
          <Fragment key={step.label}>
            <BreadcrumbItem>
              {step.status === 'current' ? (
                <BreadcrumbPage className="font-medium text-foreground">
                  {step.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <span className={cn(step.status === 'complete' ? 'text-foreground' : 'text-muted-foreground')}>
                    {step.label}
                  </span>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < steps.length - 1 ? <BreadcrumbSeparator /> : null}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
