import Link from 'next/link'
import { SectionContainer } from '@/components/layout/shared'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { resourcesListData } from './resources-list.data'

export function ResourcesList() {
  return (
    <SectionContainer aria-labelledby="resource-list-heading">
      <ItemGroup className="gap-8">
        <Item className="flex w-full flex-col items-center border-0 p-0 text-center">
          <ItemContent className="max-w-3xl items-center gap-3 text-center">
            <ItemTitle id="resource-list-heading" className="justify-center">
              <span className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {resourcesListData.heading}
              </span>
            </ItemTitle>
          </ItemContent>
        </Item>

        <Item className="w-full flex-col">
          <ItemGroup className="grid gap-4 md:grid-cols-3" aria-label="Featured resources">
            {resourcesListData.resources.map((resource) => (
              <Item
                key={resource.id}
                variant="outline"
                className="flex h-full flex-col items-start gap-4 rounded-xl bg-background/60 p-6 text-left"
                aria-labelledby={`resource-${resource.id}-title`}
              >
                <div className="flex items-start gap-3">
                  {resource.icon ? (
                    <>
                      <ItemMedia variant="icon" aria-hidden="true">
                        <resource.icon className="size-5" aria-hidden="true" />
                      </ItemMedia>
                      <span className="sr-only">{resource.iconLabel}</span>
                    </>
                  ) : null}
                  <ItemContent className="gap-2">
                    <ItemTitle id={`resource-${resource.id}-title`}>{resource.title}</ItemTitle>
                    <ItemDescription className="line-clamp-none">
                      {resource.description}
                    </ItemDescription>
                    <Badge variant="outline" className="w-fit">
                      {resource.type}
                    </Badge>
                  </ItemContent>
                </div>
                <ItemActions className="justify-end pt-2">
                  <Button asChild variant="outline" size="sm">
                    <Link
                      aria-label={resource.linkLabel ?? `Open ${resource.title}`}
                      href={resource.link}
                    >
                      {resource.linkLabel ?? 'View resource'}
                    </Link>
                  </Button>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        </Item>
      </ItemGroup>
    </SectionContainer>
  )
}
