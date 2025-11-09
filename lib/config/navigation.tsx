import {
  LayoutDashboard,
  Users,
  Building2,
  MessageSquare,
  FileText,
  CreditCard,
  User,
  Settings,
  Bell,
  Home,
  Globe,
  HelpCircle,
  ShieldAlert,
  CircleAlert,
  LockKeyhole,
  Plus,
  List,
  BarChart3,
  Wallet,
  Database,
  Mail,
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import type { SidebarSection } from '@/components/layout'

// Marketing Navigation (Header)
export const MARKETING_NAV_ITEMS = [
  { label: 'Home', href: ROUTES.HOME },
  { label: 'Services', href: ROUTES.SERVICES },
  { label: 'Pricing', href: ROUTES.PRICING },
  { label: 'Case Studies', href: ROUTES.CASE_STUDIES },
  { label: 'Resources', href: ROUTES.RESOURCES },
  { label: 'About', href: ROUTES.ABOUT },
  { label: 'Contact', href: ROUTES.CONTACT },
] as const

// Footer Navigation
export const FOOTER_NAVIGATION = {
  product: [
    { name: 'Pricing', href: ROUTES.PRICING },
    { name: 'About', href: ROUTES.ABOUT },
    { name: 'Contact', href: ROUTES.CONTACT },
  ],
  account: [
    { name: 'Sign In', href: ROUTES.LOGIN },
    { name: 'Get Started', href: ROUTES.SIGNUP },
  ],
  legal: [
    { name: 'Privacy Policy', href: ROUTES.PRIVACY },
    { name: 'Terms of Service', href: ROUTES.TERMS },
  ],
} as const

// Admin Sidebar
export const ADMIN_SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    items: [
      {
        title: 'Overview',
        url: ROUTES.ADMIN_DASHBOARD,
        icon: <Home className="h-4 w-4" />,
      },
      {
        title: 'Clients',
        url: ROUTES.ADMIN_CLIENTS,
        icon: <Users className="h-4 w-4" />,
      },
      {
        title: 'Sites',
        url: ROUTES.ADMIN_SITES,
        icon: <Globe className="h-4 w-4" />,
        items: [
          {
            title: 'All Sites',
            url: ROUTES.ADMIN_SITES,
            icon: <List className="h-4 w-4" />,
          },
          {
            title: 'New Site',
            url: ROUTES.ADMIN_SITES_NEW,
            icon: <Plus className="h-4 w-4" />,
          },
        ],
      },
      {
        title: 'Support',
        url: ROUTES.ADMIN_SUPPORT,
        icon: <HelpCircle className="h-4 w-4" />,
        items: [
          {
            title: 'All Tickets',
            url: ROUTES.ADMIN_SUPPORT,
            icon: <List className="h-4 w-4" />,
          },
        ],
      },
      {
        title: 'Leads',
        url: ROUTES.ADMIN_LEADS,
        icon: <Mail className="h-4 w-4" />,
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        title: 'Analytics',
        url: ROUTES.ADMIN_ANALYTICS,
        icon: <BarChart3 className="h-4 w-4" />,
      },
      {
        title: 'Database',
        url: ROUTES.ADMIN_DATABASE,
        icon: <Database className="h-4 w-4" />,
      },
      {
        title: 'Billing',
        url: ROUTES.ADMIN_BILLING,
        icon: <Wallet className="h-4 w-4" />,
      },
      {
        title: 'Notifications',
        url: ROUTES.ADMIN_NOTIFICATIONS,
        icon: <Bell className="h-4 w-4" />,
      },
    ],
  },
  {
    title: 'Settings',
    items: [
      {
        title: 'Settings',
        url: ROUTES.ADMIN_SETTINGS,
        icon: <Settings className="h-4 w-4" />,
      },
      {
        title: 'Profile',
        url: ROUTES.ADMIN_PROFILE,
        icon: <User className="h-4 w-4" />,
      },
      {
        title: 'Audit Logs',
        url: ROUTES.ADMIN_AUDIT_LOGS,
        icon: <FileText className="h-4 w-4" />,
      },
    ],
  },
]

// Client Sidebar
export const CLIENT_SIDEBAR_SECTIONS: SidebarSection[] = [
  {
    items: [
      {
        title: 'Overview',
        url: ROUTES.CLIENT_DASHBOARD,
        icon: <LayoutDashboard className="h-4 w-4" />,
      },
      {
        title: 'My Sites',
        url: ROUTES.CLIENT_SITES,
        icon: <Building2 className="h-4 w-4" />,
      },
      {
        title: 'Subscription',
        url: ROUTES.CLIENT_SUBSCRIPTION,
        icon: <CreditCard className="h-4 w-4" />,
      },
      {
        title: 'Notifications',
        url: ROUTES.CLIENT_NOTIFICATIONS,
        icon: <Bell className="h-4 w-4" />,
      },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        title: 'Support',
        url: ROUTES.CLIENT_SUPPORT,
        icon: <MessageSquare className="h-4 w-4" />,
      },
      {
        title: 'Profile',
        url: ROUTES.CLIENT_PROFILE,
        icon: <User className="h-4 w-4" />,
      },
    ],
  },
]

// Error Boundary Quick Links
export const ERROR_QUICK_LINKS = {
  admin: [
    {
      label: 'Clients',
      href: ROUTES.ADMIN_CLIENTS,
      icon: Users,
    },
    {
      label: 'Sites',
      href: ROUTES.ADMIN_SITES,
      icon: Building2,
    },
    {
      label: 'Support',
      href: ROUTES.ADMIN_SUPPORT,
      icon: MessageSquare,
    },
    {
      label: 'Audit Logs',
      href: ROUTES.ADMIN_AUDIT_LOGS,
      icon: FileText,
    },
  ],
  client: [
    {
      label: 'Subscription',
      href: ROUTES.CLIENT_SUBSCRIPTION,
      icon: CreditCard,
    },
    {
      label: 'My Sites',
      href: ROUTES.CLIENT_SITES,
      icon: Building2,
    },
    {
      label: 'Support',
      href: ROUTES.CLIENT_SUPPORT,
      icon: MessageSquare,
    },
    {
      label: 'Profile',
      href: ROUTES.CLIENT_PROFILE,
      icon: User,
    },
  ],
  marketing: [
    { label: 'Services', href: ROUTES.SERVICES },
    { label: 'Pricing', href: ROUTES.PRICING },
    { label: 'Contact', href: ROUTES.CONTACT },
  ],
  auth: [
    { label: 'Login', href: ROUTES.LOGIN },
    { label: 'Sign Up', href: ROUTES.SIGNUP },
    { label: 'Home', href: ROUTES.HOME },
  ],
} as const

// Error Boundary Icons
export const ERROR_ICONS = {
  admin: ShieldAlert,
  client: CircleAlert,
  marketing: CircleAlert,
  auth: LockKeyhole,
} as const
