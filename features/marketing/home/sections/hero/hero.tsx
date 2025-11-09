import { SectionContainer } from '@/components/layout/shared'
import { HeroVideo } from './hero-video'

export function Hero() {
  return (
    <SectionContainer
      aria-labelledby="home-hero-heading"
      className="relative"
      mobileEdgeToEdge
      textAlign="center"
      padding="xl"
      maxWidth="6xl"
    >
      <div className="flex flex-col items-center gap-12">
        <h1 id="home-hero-heading" className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
          Your Canadian Marketing Site.
          <br />
          Built, Hosted & Optimized.
        </h1>

        <HeroVideo />
      </div>
    </SectionContainer>
  )
}
