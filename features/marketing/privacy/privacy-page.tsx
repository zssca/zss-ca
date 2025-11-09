import { SectionContainer } from '@/components/layout/shared'
import { Item } from '@/components/ui/item'
import { siteConfig } from '@/lib/config/site.config'
import { privacyPageData } from './privacy-page.data'

export async function PrivacyPage() {
  return (
    <div className="container mx-auto flex flex-col gap-16 px-4 py-16 md:py-24">
      <SectionContainer className="p-0" maxWidth="4xl">
        <div className="flex flex-col items-start gap-3 text-left">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Last updated: {privacyPageData.lastUpdated}
          </p>
        </div>
      </SectionContainer>

      <SectionContainer className="p-0 space-y-10" maxWidth="4xl">
        <div className="prose prose-neutral dark:prose-invert">
          {privacyPageData.sections.map((section, idx) => (
            <Item key={idx} asChild className="block border-none rounded-none p-0 text-base">
              <section>
                <h2 className="mb-4 text-2xl font-bold">{section.title}</h2>
                {section.content && (
                  <p className="text-muted-foreground">
                    {section.title === 'Introduction'
                      ? `${siteConfig.name} ("we," "our," or "us") ${section.content}`
                      : section.content}
                  </p>
                )}
                {section.list && (
                  <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                    {section.list.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
                {section.subsections?.map((sub, subIdx) => (
                  <div key={subIdx} className={subIdx > 0 ? 'mt-6' : 'mt-4'}>
                    <h3 className="mb-3 text-xl font-semibold">{sub.title}</h3>
                    <p className="mb-4 text-muted-foreground">{sub.content}</p>
                    {sub.list && (
                      <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
                        {sub.list.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    )}
                    {sub.footer && <p className="mt-4 text-muted-foreground">{sub.footer}</p>}
                  </div>
                ))}
              </section>
            </Item>
          ))}

          <section>
            <h2 className="mb-4 text-2xl font-bold">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href={`mailto:${siteConfig.contact.email}`} className="text-primary hover:underline">
                {siteConfig.contact.email}
              </a>
              .
            </p>
          </section>
        </div>
      </SectionContainer>
    </div>
  )
}
