'use client'

export function LeadsTableEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <p className="text-lg font-medium">No leads found</p>
      <p className="text-sm text-muted-foreground">
        Submissions will appear here when users fill out the contact form
      </p>
    </div>
  )
}
