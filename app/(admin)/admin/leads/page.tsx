import { LeadsPageFeature } from '@/features/admin/leads/components'
type LeadsPageProps = { searchParams?: Promise<{ status?: string; service?: string; search?: string }> }
export const metadata = {
  title: 'Lead Management | Admin',
  description: 'View and manage contact form submissions',
}
export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const params = await searchParams
  return <LeadsPageFeature searchParams={params} />
}
