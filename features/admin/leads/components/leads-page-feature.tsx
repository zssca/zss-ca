import { getContactSubmissions, getContactSubmissionStats } from '../api/queries'
import { LeadsStats } from './leads-stats'
import { LeadsTable } from './leads-table'
import { LeadsFilters } from './leads-filters'
import { ExportCSVButton } from './export-csv-button'

interface LeadsPageFeatureProps {
  searchParams?: {
    status?: string
    service?: string
    search?: string
  }
}

export async function LeadsPageFeature({ searchParams }: LeadsPageFeatureProps) {
  const [{ submissions }, { stats }] = await Promise.all([
    getContactSubmissions({
      status: searchParams?.status,
      serviceInterest: searchParams?.service,
      searchQuery: searchParams?.search,
      limit: 100,
    }),
    getContactSubmissionStats(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Management</h1>
          <p className="text-muted-foreground">
            View and manage contact form submissions from your marketing site
          </p>
        </div>
        <ExportCSVButton
          filters={{
            status: searchParams?.status,
            serviceInterest: searchParams?.service,
            searchQuery: searchParams?.search,
          }}
        />
      </div>

      <LeadsStats stats={stats} />

      <div className="flex flex-col gap-4">
        <LeadsFilters />
        <LeadsTable submissions={submissions} />
      </div>
    </div>
  )
}
