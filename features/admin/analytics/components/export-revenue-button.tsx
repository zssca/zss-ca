"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  exportRevenueDataAsCSV,
  exportChurnDataAsCSV,
  exportCustomerLTVAsCSV,
  exportSubscriptionHistoryAsCSV,
  downloadCSV,
} from "../utils/export-revenue-data"

interface ExportRevenueButtonProps {
  dateRange?: {
    from: Date
    to: Date
  }
}

export function ExportRevenueButton({ dateRange }: ExportRevenueButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async (type: string) => {
    setIsExporting(true)
    try {
      const from = dateRange?.from || new Date(new Date().setMonth(new Date().getMonth() - 12))
      const to = dateRange?.to || new Date()

      let csvContent: string
      let filename = ''

      switch (type) {
        case "revenue":
          csvContent = await exportRevenueDataAsCSV(from, to)
          filename = `revenue-data-${formatDateForFilename(from)}-to-${formatDateForFilename(to)}.csv`
          break
        case "churn":
          csvContent = await exportChurnDataAsCSV(from, to)
          filename = `churn-data-${formatDateForFilename(from)}-to-${formatDateForFilename(to)}.csv`
          break
        case "ltv":
          csvContent = await exportCustomerLTVAsCSV()
          filename = `customer-ltv-${formatDateForFilename(new Date())}.csv`
          break
        case "history":
          csvContent = await exportSubscriptionHistoryAsCSV(from, to)
          filename = `subscription-history-${formatDateForFilename(from)}-to-${formatDateForFilename(to)}.csv`
          break
        default:
          throw new Error("Invalid export type")
      }

      downloadCSV(csvContent, filename)

      toast({
        title: "Export successful",
        description: `Your ${type} data has been exported to CSV.`,
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("revenue")}>
          <Download className="mr-2 h-4 w-4" />
          Revenue & MRR Data
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("churn")}>
          <Download className="mr-2 h-4 w-4" />
          Churn Analysis
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("ltv")}>
          <Download className="mr-2 h-4 w-4" />
          Customer LTV Data
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("history")}>
          <Download className="mr-2 h-4 w-4" />
          Subscription History
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function formatDateForFilename(date: Date): string {
  const iso = date.toISOString()
  const [day] = iso.split("T")
  return day ?? iso
}
