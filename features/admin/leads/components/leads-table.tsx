'use client'

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ContactSubmissionWithProfile } from '../api/queries'
import { LeadsTableEmptyState } from './leads-table-empty'
import { LeadsTableRow } from './leads-table-row'
import { useLeadActions } from '../hooks'

interface LeadsTableProps {
  submissions: ContactSubmissionWithProfile[]
}

export function LeadsTable({ submissions }: LeadsTableProps) {
  const { handleStatusChange, handleDelete, updatingId } = useLeadActions()

  if (submissions.length === 0) {
    return <LeadsTableEmptyState />
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Service Interest</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Lead Score</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => (
            <LeadsTableRow
              key={submission.id}
              submission={submission}
              updatingId={updatingId}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
