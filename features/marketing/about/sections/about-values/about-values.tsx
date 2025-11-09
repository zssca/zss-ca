import { SectionContainer } from '@/components/layout/shared'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { aboutValuesData } from './about-values.data'

export function AboutValues() {
  return (
    <SectionContainer>
      <ItemGroup className="gap-10">
        <Item className="flex w-full flex-col items-center border-0 p-0 text-center">
          <ItemContent className="max-w-3xl items-center gap-3 text-center">
            <ItemTitle className="justify-center">
              <span className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {aboutValuesData.title}
              </span>
            </ItemTitle>
          </ItemContent>
        </Item>
        <Item className="w-full flex-col">
          <ItemGroup
            className="grid gap-4 md:grid-cols-2"
            aria-label="Agency values"
          >
            {aboutValuesData.values.map((value) => {
              const valueId = `about-value-${value.title.replace(/\s+/g, '-').toLowerCase()}`
              return (
                <Item
                  key={value.title}
                  variant="outline"
                  className="flex h-full flex-col items-start gap-4 rounded-xl bg-background/60 p-6 text-left"
                  aria-labelledby={valueId}
                >
                  <div className="flex items-start gap-3">
                    {value.icon ? (
                      <>
                        <ItemMedia variant="icon" aria-hidden="true">
                          <value.icon className="size-5" aria-hidden="true" />
                        </ItemMedia>
                        <span className="sr-only">{value.iconLabel}</span>
                      </>
                    ) : null}
                    <ItemContent className="gap-2">
                      <ItemTitle id={valueId}>{value.title}</ItemTitle>
                      <ItemDescription className="line-clamp-none">
                        {value.description}
                      </ItemDescription>
                      {value.helper ? (
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {value.helper}
                        </p>
                      ) : null}
                    </ItemContent>
                  </div>
                </Item>
              )
            })}
          </ItemGroup>
        </Item>
      </ItemGroup>
    </SectionContainer>
  )
}
