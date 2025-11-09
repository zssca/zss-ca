'use client'

import { Badge } from '@/components/ui/badge'
import { Field, FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { BillingInterval } from './pricing-plans.types'

type BillingIntervalToggleProps = {
  value: BillingInterval
  onChange: (interval: BillingInterval) => void
}

export function BillingIntervalToggle({ value, onChange }: BillingIntervalToggleProps) {
  return (
    <FieldSet className="rounded-2xl border border-border/70 bg-background/80 p-6">
      <FieldLegend>Billing interval</FieldLegend>
      <FieldDescription>Toggle between monthly and yearly pricing to compare savings.</FieldDescription>
      <Field className="justify-center">
        <ToggleGroup
          type="single"
          aria-label="Billing interval options"
          value={value}
          onValueChange={(interval) => interval && onChange(interval as BillingInterval)}
        >
          <ToggleGroupItem value="monthly" aria-label="Monthly billing">
            Monthly
          </ToggleGroupItem>
          <ToggleGroupItem value="yearly" aria-label="Yearly billing">
            <span className="flex items-center gap-2">
              Yearly
              <Badge variant="secondary">Save 20%</Badge>
            </span>
          </ToggleGroupItem>
        </ToggleGroup>
      </Field>
    </FieldSet>
  )
}
