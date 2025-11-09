'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  updateContactSubmissionStatus,
  deleteContactSubmission,
} from '../api/mutations'

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'closed_lost'

export function useLeadActions() {
  const router = useRouter()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleStatusChange = async (submissionId: string, newStatus: LeadStatus) => {
    setUpdatingId(submissionId)
    try {
      const result = await updateContactSubmissionStatus(submissionId, newStatus)
      if (result.success) {
        toast.success('Status updated successfully')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update status')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) {
      return
    }

    setUpdatingId(submissionId)
    try {
      const result = await deleteContactSubmission(submissionId)
      if (result.success) {
        toast.success('Lead deleted successfully')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to delete lead')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setUpdatingId(null)
    }
  }

  return {
    updatingId,
    handleStatusChange,
    handleDelete,
  }
}
