import Link from 'next/link'
import { SectionContainer } from '@/components/layout/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { resourcesCategoriesData } from './resources-categories.data'

export function ResourcesCategories() {
  return (
    <SectionContainer aria-labelledby="resource-categories-heading">
      <ItemGroup className="gap-8">
        <Item className="flex w-full flex-col items-center border-0 p-0 text-center">
          <ItemContent className="max-w-3xl items-center gap-3 text-center">
            <ItemTitle id="resource-categories-heading" className="justify-center">
              <span className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {resourcesCategoriesData.heading}
              </span>
            </ItemTitle>
          </ItemContent>
        </Item>

        <Item className="w-full flex-col">
          <ItemGroup className="grid gap-4 md:grid-cols-3" aria-label="Resource categories">
            {resourcesCategoriesData.categories.map((category) => (
              <Item
                key={category.id}
                variant="outline"
                className="flex h-full flex-col items-start gap-4 rounded-xl bg-background/60 p-6 text-left"
                aria-labelledby={`resource-category-${category.id}`}
              >
                <div className="flex items-start gap-3">
                  {category.icon ? (
                    <>
                      <ItemMedia variant="icon" aria-hidden="true">
                        <category.icon className="size-5" aria-hidden="true" />
                      </ItemMedia>
                      <span className="sr-only">{category.iconLabel}</span>
                    </>
                  ) : null}
                  <ItemContent className="gap-2">
                    {category.eyebrow ? (
                      <Badge variant="outline" className="w-fit">
                        {category.eyebrow}
                      </Badge>
                    ) : null}
                    <ItemTitle id={`resource-category-${category.id}`}>{category.name}</ItemTitle>
                    <ItemDescription className="line-clamp-none">
                      {category.description}
                    </ItemDescription>
                  </ItemContent>
                </div>
                {category.href ? (
                  <Button asChild size="sm" variant="outline">
                    <Link href={category.href}>{category.linkLabel ?? 'View resources'}</Link>
                  </Button>
                ) : null}
              </Item>
            ))}
          </ItemGroup>
        </Item>
      </ItemGroup>
    </SectionContainer>
  )
}
