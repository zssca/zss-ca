'use client'

export const STATUS_FILTERS: Record<string, string[]> = {
  live: ['live'],
  in_production: ['in_production'],
  pending: ['pending', 'awaiting_client_content'],
  paused: ['paused', 'archived'],
}

export const STATUS_DESCRIPTIONS: Record<string, string> = {
  pending: 'Site has been created but work has not started.',
  in_production: 'The production team is actively building the site.',
  awaiting_client_content: 'Waiting for the client to provide content or assets.',
  ready_for_review: 'Development complete and awaiting client review.',
  live: 'Site is live and accessible to end users.',
  paused: 'Work has been temporarily paused.',
  archived: 'Site has been archived and is no longer active.',
}

export const STATUS_TOGGLE_OPTIONS: Array<{ value: keyof typeof STATUS_FILTERS; label: string }> = [
  { value: 'live', label: 'Live' },
  { value: 'in_production', label: 'In Production' },
  { value: 'pending', label: 'Pending' },
  { value: 'paused', label: 'Paused' },
]
