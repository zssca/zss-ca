import 'server-only'

import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { getCurrentProfile, getUserPreferences, ProfileForm, UserPreferencesForm } from '@/features/client/profile'
import { Item, ItemContent, ItemDescription, ItemHeader, ItemTitle } from '@/components/ui/item'

export async function AdminProfileFeature(): Promise<React.JSX.Element> {
  const [profile, preferences] = await Promise.all([
    getCurrentProfile(),
    getUserPreferences(),
  ])

  if (!profile || !preferences) redirect(ROUTES.LOGIN)
  if (profile.role !== 'admin') redirect(ROUTES.CLIENT_DASHBOARD)

  return (
    <div className="space-y-6">
      <Item variant="outline">
        <ItemHeader>
          <ItemTitle>Personal Information</ItemTitle>
          <ItemDescription>Manage the details associated with your admin account</ItemDescription>
        </ItemHeader>
        <ItemContent>
          <ProfileForm profile={profile} />
        </ItemContent>
      </Item>
      <Item variant="outline">
        <ItemHeader>
          <ItemTitle>Notifications & appearance</ItemTitle>
          <ItemDescription>Configure alert delivery, locale, and dashboard theme</ItemDescription>
        </ItemHeader>
        <ItemContent>
          <UserPreferencesForm preferences={preferences} />
        </ItemContent>
      </Item>
    </div>
  )
}
