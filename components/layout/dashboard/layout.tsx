import 'server-only'

import { requireAdmin, requireClient } from '@/lib/auth/verify-access'
import { getSidebarState } from '@/lib/utils/sidebar-state'
import {
  Sidebar,
  SidebarHeader,
  SidebarProvider,
  SidebarInset,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Breadcrumbs } from './breadcrumbs'
import { NavUser } from './nav-user'
import { Search } from './search'
import { SidebarNav } from './sidebar-nav'
import { PageHeader } from './page-header'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'
import type { SidebarSection } from './sidebar-nav'

export interface DashboardLayoutProps {
  children: React.ReactNode
  role: 'admin' | 'client'
  user: {
    name: string
    email: string
    avatar?: string
  }
  sidebarSections: SidebarSection[]
  breadcrumbHomeHref: string
  breadcrumbHomeLabel: string
  pageTitle?: string
  pageDescription?: string
  pageActions?: React.ReactNode
}

export async function DashboardLayout({
  children,
  role,
  user,
  sidebarSections,
  breadcrumbHomeHref,
  breadcrumbHomeLabel,
  pageTitle,
  pageDescription,
  pageActions,
}: DashboardLayoutProps) {
  await (role === 'admin' ? requireAdmin() : requireClient())
  const defaultOpen = await getSidebarState()

  return (
    <>
      {/* Skip to main content link for keyboard navigation (WCAG 2.1 SC 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>

      <SidebarProvider defaultOpen={defaultOpen}>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <NavUser user={user} role={role} />
          </SidebarHeader>
          <SidebarNav sections={sidebarSections} />
          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <header className="shrink-0 border-b">
            <div className="flex h-16 items-center gap-2 px-4 transition-[height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-full"
              />
              <Breadcrumbs homeHref={breadcrumbHomeHref} homeLabel={breadcrumbHomeLabel} />
              <div className="ml-auto flex items-center gap-2">
                <AnimatedThemeToggler />
                <Search role={role} user={user} />
              </div>
            </div>
            <PageHeader
              pageTitle={pageTitle}
              pageDescription={pageDescription}
              pageActions={pageActions}
            />
          </header>
          <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col gap-6 p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
