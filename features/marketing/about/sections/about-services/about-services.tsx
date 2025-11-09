import Link from 'next/link'
import { SectionContainer } from '@/components/layout/shared'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'
import { ROUTES } from '@/lib/constants/routes'
import { aboutServicesData } from './about-services.data'

export function AboutServices() {
  return (
    <SectionContainer>
      <ItemGroup className="gap-8">
        <Item className="flex w-full flex-col items-center border-0 p-0 text-center">
          <ItemContent className="max-w-3xl items-center gap-3 text-center">
            <ItemTitle className="justify-center">
              <span className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {aboutServicesData.title}
              </span>
            </ItemTitle>
            <ItemDescription className="text-base text-muted-foreground sm:text-lg">
              Subscription-first delivery keeps every client launch on track.
            </ItemDescription>
          </ItemContent>
        </Item>
        <Item className="w-full flex-col gap-4">
          <Accordion
            type="single"
            collapsible
            className="w-full"
            aria-label="Engagement services"
          >
            {aboutServicesData.items.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>{item.title}</AccordionTrigger>
                <AccordionContent>
                  <ItemDescription className="line-clamp-none text-sm text-muted-foreground">
                    {item.description}
                  </ItemDescription>
                  {item.helper ? (
                    <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                      {item.helper}
                    </p>
                  ) : null}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Item>

        <Item className="justify-center">
          <Button asChild size="lg" variant="outline">
            <Link href={ROUTES.CONTACT}>Talk to a solutions lead</Link>
          </Button>
        </Item>
      </ItemGroup>
    </SectionContainer>
  )
}
