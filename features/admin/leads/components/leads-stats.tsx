import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface LeadsStatsProps {
  stats: {
    total: number
    new: number
    contacted: number
    qualified: number
    converted: number
    closedLost: number
  }
}

export function LeadsStats({ stats }: LeadsStatsProps) {
  const statCards = [
    {
      title: 'Total Leads',
      value: stats.total,
      description: 'All submissions',
      color: 'text-blue-600',
    },
    {
      title: 'New',
      value: stats.new,
      description: 'Awaiting contact',
      color: 'text-green-600',
    },
    {
      title: 'Contacted',
      value: stats.contacted,
      description: 'First contact made',
      color: 'text-purple-600',
    },
    {
      title: 'Qualified',
      value: stats.qualified,
      description: 'Sales qualified',
      color: 'text-amber-600',
    },
    {
      title: 'Converted',
      value: stats.converted,
      description: 'Became customers',
      color: 'text-emerald-600',
    },
    {
      title: 'Closed Lost',
      value: stats.closedLost,
      description: 'Not pursuing',
      color: 'text-slate-500',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
