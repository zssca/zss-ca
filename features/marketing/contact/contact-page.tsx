import { ContactHero, ContactOverview, ContactSteps, ContactForm } from './sections'
import { organizationSchema, generateBreadcrumbSchema } from '@/lib/config/structured-data'
import { siteConfig } from '@/lib/config/site.config'

export async function ContactPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: siteConfig.url },
    { name: 'Contact', url: `${siteConfig.url}/contact` },
  ])

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="container mx-auto flex flex-col gap-16 px-4 py-16 md:py-24">
        <ContactHero />
        <ContactOverview />
        <ContactSteps />
        <ContactForm />
      </div>
    </>
  )
}
