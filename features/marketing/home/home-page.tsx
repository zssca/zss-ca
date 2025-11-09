import {
  Hero,
  Partners,
  Metrics,
  Features,
  CaseStudiesPreview,
  Process,
  Industries,
  PricingPreview,
  Support,
  Testimonials,
  Faq,
  Cta,
} from './sections'
import {
  organizationSchema,
  websiteSchema,
  serviceSchema,
} from '@/lib/config/structured-data'

export async function HomePage() {
  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <main className="flex flex-col">
        <Hero />
        <Partners />
        <Metrics />
        <Features />
        <CaseStudiesPreview />
        <Process />
        <Industries />
        <PricingPreview />
        <Support />
        <Testimonials />
        <Faq />
        <Cta />
      </main>
    </>
  )
}
