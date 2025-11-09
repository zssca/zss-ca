'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database, Shield, Key, Zap, FunctionSquare, GitBranch } from 'lucide-react'
import type { DatabaseHealth } from '../api'

interface DatabaseHealthCardProps {
  data: DatabaseHealth[]
}

const iconMap: Record<string, React.ReactNode> = {
  Tables: <Database className="h-4 w-4" />,
  Indexes: <Key className="h-4 w-4" />,
  'RLS Enabled Tables': <Shield className="h-4 w-4" />,
  'RLS Policies': <Shield className="h-4 w-4" />,
  Functions: <FunctionSquare className="h-4 w-4" />,
  Triggers: <Zap className="h-4 w-4" />,
}

export function DatabaseHealthCard({ data }: DatabaseHealthCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Database Health</CardTitle>
          </div>
          <Badge variant="outline">Live</Badge>
        </div>
        <CardDescription>
          Real-time database statistics and configuration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((stat) => (
            <div
              key={stat.category}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-2">
                {iconMap[stat.category] || <GitBranch className="h-4 w-4" />}
                <span className="text-sm font-medium">{stat.category}</span>
              </div>
              <span className="text-2xl font-semibold">{stat.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
