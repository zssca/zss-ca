import Link from 'next/link'
import { SectionContainer } from '@/components/layout/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Item, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { ROUTES } from '@/lib/constants/routes'
import { testimonialsData } from './testimonials.data'

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function Testimonials() {
  return (
    <SectionContainer
      heading={testimonialsData.heading}
      description={testimonialsData.subheading}
      textAlign="center"
      headerMaxWidth="3xl"
    >
      <Carousel
        opts={{ align: 'start', loop: true }}
        className="relative w-full"
        aria-label="Client testimonials"
      >
        <CarouselContent className="-ml-4">
          {testimonialsData.testimonials.map((testimonial) => (
            <CarouselItem
              key={testimonial.id}
              className="pl-4 md:basis-1/2 lg:basis-1/3"
              aria-label={`Testimonial from ${testimonial.name}`}
            >
              <Item
                variant="outline"
                className="flex h-full flex-col gap-4 rounded-2xl border border-border/70 bg-background/80 p-6"
                aria-labelledby={`${testimonial.id}-title`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <ItemMedia variant="icon">
                      <Avatar className="size-12">
                        <AvatarFallback className="text-base font-semibold">
                          {getInitials(testimonial.name)}
                        </AvatarFallback>
                      </Avatar>
                    </ItemMedia>
                    <div className="flex flex-col gap-1">
                      <ItemTitle id={`${testimonial.id}-title`}>{testimonial.name}</ItemTitle>
                      <ItemDescription className="text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </ItemDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" aria-label={`${testimonial.rating} star rating`}>
                    {`${testimonial.rating}★`}
                  </Badge>
                </div>
                <ItemDescription className="line-clamp-none text-sm leading-relaxed text-muted-foreground">
                  {testimonial.content}
                </ItemDescription>
              </Item>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-10 hidden md:flex" />
        <CarouselNext className="-right-10 hidden md:flex" />
      </Carousel>

      <div className="flex justify-center">
        <Button asChild size="lg" variant="outline">
          <Link href={ROUTES.CASE_STUDIES}>See the full client stories</Link>
        </Button>
      </div>
    </SectionContainer>
  )
}
