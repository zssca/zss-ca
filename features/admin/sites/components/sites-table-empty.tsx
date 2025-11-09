'use client'

import Link from 'next/link'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { ROUTES } from '@/lib/constants/routes'

export function SitesTableZeroState() {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Globe className="size-6" />
        </EmptyMedia>
        <EmptyTitle>No sites found</EmptyTitle>
        <EmptyDescription>
          Create a site to get started or import an existing deployment.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild variant="outline" size="sm">
          <Link href={`${ROUTES.ADMIN_SITES}/new`}>Create Site</Link>
        </Button>
      </EmptyContent>
    </Empty>
  )
}

export function SitesTableNoResults() {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyTitle>No matching sites</EmptyTitle>
        <EmptyDescription>Adjust your search or status filters to view results.</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
