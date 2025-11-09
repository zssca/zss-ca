import { Mail, Phone, MapPin } from 'lucide-react'
import { siteConfig } from '@/lib/config/site.config'
import type { ContactOverviewData } from './contact-overview.types'

const { contact } = siteConfig

export const contactOverviewData: ContactOverviewData = {
  heading: "Multiple ways to reach our delivery team",
  subheading:
    'Share your project goals and we’ll craft a subscription plan, sprint outline, and pricing breakdown in under one business day.',
  channels: [
    {
      label: 'Email',
      value: contact.email,
      href: `mailto:${contact.email}`,
      icon: Mail,
    },
    {
      label: 'Phone',
      value: contact.phone,
      href: `tel:${contact.phone.replace(/[^+\d]/g, '')}`,
      icon: Phone,
    },
  ],
  office: {
    addressLines: [
      contact.address.line1,
      `${contact.address.city}, ${contact.address.region} ${contact.address.postal}`,
      contact.address.country,
    ],
    hours: 'Office hours: Monday–Friday, 9am–5pm MT',
    note: 'In-person sessions available by appointment only.',
  },
  cta: {
    ariaLabel: 'Book a discovery call via email',
    label: 'Book a discovery call',
    href: `mailto:${contact.email}`,
  },
}

export const contactLocationIcon = MapPin
