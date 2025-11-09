import 'server-only'

import Link from 'next/link'
import Image from 'next/image'
import {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu'
import { ROUTES } from '@/lib/constants/routes'
import { siteConfig, MARKETING_NAV_ITEMS } from '@/lib/config'
import { getUserWithProfile } from '@/lib/auth/get-user-with-profile'
import { HeaderMobileMenu } from './header-mobile-menu'
import { HeaderAuthActions } from './header-auth-actions'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'

export default async function Header() {
  const userWithProfile = await getUserWithProfile()
  const user = userWithProfile?.user
  const profile = userWithProfile?.profile

  const portalLink = user
    ? profile?.role === 'admin'
      ? { label: 'Admin Portal', href: ROUTES.ADMIN_DASHBOARD }
      : { label: 'Client Portal', href: ROUTES.CLIENT_DASHBOARD }
    : null

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6"
      >
        <div className="flex items-center gap-6">
          <Link
            href={ROUTES.HOME}
            className="flex items-center gap-2 font-semibold tracking-tight transition-colors hover:text-foreground/80"
            aria-label="Go to homepage"
          >
            <Image
              src="/logo.svg"
              alt={`${siteConfig.name} logo`}
              width={32}
              height={32}
              className="size-8"
              priority
            />
            <span className="hidden text-base sm:inline-block">{siteConfig.name}</span>
            <span className="text-base sm:hidden">{siteConfig.shortName}</span>
          </Link>
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {MARKETING_NAV_ITEMS.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link href={item.href}>{item.label}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
              {portalLink ? (
                <NavigationMenuItem key={portalLink.href}>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link href={portalLink.href}>{portalLink.label}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ) : null}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center gap-2">
          <AnimatedThemeToggler />
          <HeaderMobileMenu user={user} profile={profile} portalLink={portalLink} />
          <HeaderAuthActions user={user} profile={profile} />
        </div>
      </nav>
    </header>
  )
}
