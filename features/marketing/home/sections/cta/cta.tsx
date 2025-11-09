import Link from 'next/link'
import { Check } from 'lucide-react'
import { SectionContainer } from '@/components/layout/shared'
import { Button } from '@/components/ui/button'
import {
  Item,
  ItemDescription,
  ItemGroup,
  ItemMedia,
} from '@/components/ui/item'
import { ctaData } from './cta.data'

export function Cta() {
  return (
    <SectionContainer
      heading={ctaData.heading}
      description={ctaData.description}
      background="primary"
      rounded
      padding="lg"
    >
      <ItemGroup className="gap-3" aria-label="Reasons to schedule a call">
        {ctaData.bullets.map((bullet) => (
          <Item key={bullet} className="items-start gap-3 border-0 p-0">
            <ItemMedia variant="icon" aria-hidden="true">
              <Check className="size-4" aria-hidden="true" />
            </ItemMedia>
            <ItemDescription className="text-primary-foreground/90 text-base">
              {bullet}
            </ItemDescription>
          </Item>
        ))}
      </ItemGroup>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg" variant="secondary">
          <Link href={ctaData.cta.primary.href}>{ctaData.cta.primary.label}</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="bg-white/10 text-primary-foreground hover:bg-white/20">
          <Link href={ctaData.cta.secondary.href}>{ctaData.cta.secondary.label}</Link>
        </Button>
      </div>
    </SectionContainer>
  )
}
