'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { exportContactSubmissionsToCSV } from '../api/actions'

interface ExportCSVButtonProps {
  filters?: {
    status?: string
    serviceInterest?: string
    searchQuery?: string
  }
}

/**
 * Export contact submissions to CSV
 * Implements P0 data loss prevention requirement
 */
export function ExportCSVButton({ filters }: ExportCSVButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const result = await exportContactSubmissionsToCSV(filters)

      if (result.success && result.csv && result.filename) {
        // Create blob and download
        const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)

        link.setAttribute('href', url)
        link.setAttribute('download', result.filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Clean up
        URL.revokeObjectURL(url)

        toast.success('CSV exported successfully')
      } else {
        toast.error(result.error || 'Failed to export CSV')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Export CSV
        </>
      )}
    </Button>
  )
}
