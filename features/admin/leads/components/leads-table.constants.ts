'use client'

export const statusColors: Record<string, string> = {
  new: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  contacted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  qualified: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  converted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  closed_lost: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
}

export const statusLabels: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  converted: 'Converted',
  closed_lost: 'Closed Lost',
}

export const serviceLabels: Record<string, string> = {
  website_build: 'Website Build',
  consultation: 'Consultation',
  support: 'Support',
  other: 'Other',
}
