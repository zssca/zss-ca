import { SectionContainer } from '@/components/layout/shared'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from '@/components/ui/item'
import { aboutMissionData } from './about-mission.data'

export function AboutMission() {
  const headingId = 'about-mission-heading'

  return (
    <SectionContainer aria-labelledby={headingId}>
      <ItemGroup className="gap-8 text-center">
        <Item className="flex w-full flex-col items-center border-0 p-0 text-center" aria-labelledby={headingId}>
          <ItemContent className="max-w-3xl items-center gap-4 text-center">
            <ItemTitle id={headingId} className="justify-center">
              <span className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                {aboutMissionData.title}
              </span>
            </ItemTitle>
            <ItemDescription className="text-base text-muted-foreground sm:text-lg">
              {aboutMissionData.description}
            </ItemDescription>
          </ItemContent>
        </Item>

        <Item className="w-full flex-col">
          <ItemGroup className="grid gap-4 md:grid-cols-3" aria-label="Mission pillars">
            {aboutMissionData.pillars.map((pillar) => (
              <Item key={pillar.title} variant="outline" className="flex h-full flex-col gap-3 rounded-2xl border border-border/70 bg-background/80 p-6 text-left">
                <ItemTitle className="text-lg font-semibold">{pillar.title}</ItemTitle>
                <ItemDescription className="text-sm text-muted-foreground">
                  {pillar.description}
                </ItemDescription>
              </Item>
            ))}
          </ItemGroup>
        </Item>

        <Item className="flex w-full justify-center border-0 p-0">
          <ItemDescription className="max-w-3xl text-center text-sm text-muted-foreground">
            {aboutMissionData.commitment}
          </ItemDescription>
        </Item>
      </ItemGroup>
    </SectionContainer>
  )
}
