'use client'

import Link from 'next/link'
import {
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ExternalLink, MoreHorizontal, Trash2 } from 'lucide-react'
import type { ContactSubmissionWithProfile } from '../api/queries'
import { statusColors, statusLabels, serviceLabels } from './leads-table.constants'
import { formatLeadDate } from '../utils'

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'closed_lost'

interface LeadsTableRowProps {
  submission: ContactSubmissionWithProfile
  updatingId: string | null
  onStatusChange: (id: string, status: LeadStatus) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function LeadsTableRow({
  submission,
  updatingId,
  onStatusChange,
  onDelete,
}: LeadsTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{submission.full_name}</TableCell>
      <TableCell>{submission.company_name || '-'}</TableCell>
      <TableCell>
        <a
          href={`mailto:${submission.email}`}
          className="text-blue-600 hover:underline dark:text-blue-400"
        >
          {submission.email}
        </a>
      </TableCell>
      <TableCell>
        <Badge variant="outline">
          {serviceLabels[submission.service_interest] || submission.service_interest}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={statusColors[submission.status || 'new']}>
          {statusLabels[submission.status || 'new']}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="font-semibold">{submission.lead_score || 0}</span>
      </TableCell>
      <TableCell>{formatLeadDate(submission.created_at)}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              disabled={updatingId === submission.id}
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onStatusChange(submission.id, 'contacted')}>
              Mark as Contacted
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(submission.id, 'qualified')}>
              Mark as Qualified
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(submission.id, 'converted')}>
              Mark as Converted
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(submission.id, 'closed_lost')}>
              Mark as Closed Lost
            </DropdownMenuItem>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/admin/leads/${submission.id}`}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(submission.id)}
              className="text-red-600 dark:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
