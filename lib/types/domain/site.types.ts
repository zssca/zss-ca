import type {
  ClientSiteRow,
  PlanRow,
  ProfileRow,
  SubscriptionRow,
} from '../database-aliases'

export type ClientSite = ClientSiteRow

export interface SiteWithRelations extends ClientSiteRow {
  owner?: ProfileRow | null
  subscription?: SubscriptionRow | null
  plan?: PlanRow | null
}

export interface SiteDeploymentStatus {
  environment: 'staging' | 'production'
  url: string
  status: 'deploying' | 'live' | 'failed'
  updatedAt: string
  lastCommitId?: string
}

export interface SiteTimelineEvent {
  id: string
  type:
    | 'site_created'
    | 'design_uploaded'
    | 'content_updated'
    | 'deployment_requested'
    | 'deployment_completed'
    | 'deployment_failed'
  timestamp: string
  metadata?: Record<string, unknown>
}
