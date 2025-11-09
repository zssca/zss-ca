'use client'

import Link from 'next/link'
import { SectionContainer } from '@/components/layout/shared'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from '@/components/ui/card'
import { ItemDescription } from '@/components/ui/item'
import { faqData } from './faq.data'

export function Faq() {
  return (
    <SectionContainer
      heading={faqData.heading}
      description={faqData.subheading}
      textAlign="center"
      headerMaxWidth="3xl"
    >
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Accordion
          type="single"
          collapsible
          className="grid w-full gap-4 md:grid-cols-2"
          aria-label="Frequently asked questions"
        >
          {faqData.items.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="w-full">
              <AccordionTrigger>
                <span className="text-left">{item.question}</span>
              </AccordionTrigger>
              <AccordionContent>
                <ItemDescription className="line-clamp-none text-muted-foreground">
                  {item.answer}
                </ItemDescription>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Card className="h-full border-dashed">
          <CardContent className="space-y-4">
            <CardTitle className="text-xl font-semibold text-balance">
              {faqData.cta.title}
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              {faqData.cta.description}
            </CardDescription>
          </CardContent>
          <CardFooter>
            <Button asChild size="lg">
              <Link href={faqData.cta.primary.href}>{faqData.cta.primary.label}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </SectionContainer>
  )
}
