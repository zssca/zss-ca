import { ROUTES } from '@/lib/constants/routes'
import type { FaqData } from './faq.types'

export const faqData: FaqData = {
  heading: 'FAQs about our managed website subscription',
  subheading: 'Transparent answers so you can confidently choose the right plan.',
  items: [
    {
      id: 'launch-timeline',
      question: 'How fast can we launch?',
      answer:
        'Your first conversion-ready pages go live in 10–14 days. We run a kickoff, content audit, and design sprint in week one, then publish, QA, and iterate during week two.',
    },
    {
      id: 'what-is-included',
      question: 'What exactly is included each month?',
      answer:
        'Every subscription covers strategy, UX design, copywriting, development, hosting, security, analytics, and unlimited update requests routed through your dedicated producer.',
    },
    {
      id: 'request-process',
      question: 'How do I request updates or new pages?',
      answer:
        'Submit ideas via Slack or the client portal. We triage within one business day, confirm the brief, and schedule the work into your active sprint so you always know what ships next.',
    },
    {
      id: 'ownership',
      question: 'Who owns the site and content?',
      answer:
        'You own every piece of content, asset, and analytics data. We manage the infrastructure and tooling. Need to migrate later? We provide a full export with no penalties.',
    },
    {
      id: 'cancellation',
      question: 'Can I pause or cancel?',
      answer:
        'Yes. Pause or cancel anytime after the 3-month commitment. Your site stays live until the end of the billing period and we help transition hosting if needed.',
    },
    {
      id: 'compliance',
      question: 'Do you handle accessibility and compliance?',
      answer:
        'We design to WCAG 2.1 AA, run scheduled accessibility scans, and keep data residency within Canada to simplify compliance for regulated industries.',
    },
  ],
  cta: {
    title: 'Still have a question?',
    description: 'Tell us about your current site and we will send a personalized video walkthrough with recommendations in under 48 hours.',
    primary: {
      label: 'Ask the team',
      href: ROUTES.CONTACT,
    },
  },
}
