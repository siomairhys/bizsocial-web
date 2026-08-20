import { httpClient } from '../services/httpClient'
import { apiEndpoints } from './apiEndpoints'
import { presentationDataOrThrow } from '../services/presentationData'

const fallbackActions = [
  {
    id: 'verify-business',
    action_id: 1,
    user_id: 1,
    title: 'Business verified',
    description: 'Confirm business identity, address, EIN, and public profile details.',
    category: 'verification',
    priority: 'high',
    status: 'complete',
    impact_points: 8,
    due_date: null,
    completed_at: '2026-07-01T12:00:00Z',
    notes: null,
    sort_order: 10,
    evidence_count: 0,
    created_at: '2026-07-01T12:00:00Z',
    updated_at: '2026-07-01T12:00:00Z',
  },
  {
    id: 'connect-payment-data',
    action_id: 2,
    user_id: 1,
    title: 'Payment data connected',
    description: 'Connect payment or bank activity so readiness can reflect cash movement.',
    category: 'cash_flow',
    priority: 'high',
    status: 'complete',
    impact_points: 7,
    due_date: null,
    completed_at: '2026-07-01T12:00:00Z',
    notes: null,
    sort_order: 20,
    evidence_count: 0,
    created_at: '2026-07-01T12:00:00Z',
    updated_at: '2026-07-01T12:00:00Z',
  },
  {
    id: 'funding-profile-complete',
    action_id: 3,
    user_id: 1,
    title: 'Funding profile complete',
    description: 'Keep funding needs, use of funds, industry, and growth milestones current.',
    category: 'profile',
    priority: 'medium',
    status: 'complete',
    impact_points: 7,
    due_date: null,
    completed_at: '2026-07-01T12:00:00Z',
    notes: null,
    sort_order: 30,
    evidence_count: 0,
    created_at: '2026-07-01T12:00:00Z',
    updated_at: '2026-07-01T12:00:00Z',
  },
  {
    id: 'business-bureaus',
    action_id: 4,
    user_id: 1,
    title: 'Register with major business credit bureaus',
    description: 'Create or confirm profiles with major business credit reporting bureaus.',
    category: 'credit_health',
    priority: 'high',
    status: 'in_progress',
    impact_points: 6,
    due_date: null,
    completed_at: null,
    notes: null,
    sort_order: 40,
    evidence_count: 0,
    created_at: '2026-07-01T12:00:00Z',
    updated_at: '2026-07-01T12:00:00Z',
  },
  {
    id: 'separate-finances',
    action_id: 5,
    user_id: 1,
    title: 'Separate personal and business finances',
    description: 'Use dedicated business banking, payments, and expense records.',
    category: 'cash_flow',
    priority: 'medium',
    status: 'todo',
    impact_points: 5,
    due_date: null,
    completed_at: null,
    notes: null,
    sort_order: 50,
    evidence_count: 0,
    created_at: '2026-07-01T12:00:00Z',
    updated_at: '2026-07-01T12:00:00Z',
  },
  {
    id: 'vendor-account',
    action_id: 6,
    user_id: 1,
    title: 'Build a revolving vendor account',
    description: 'Open and pay a vendor account that reports business payment history.',
    category: 'credit_health',
    priority: 'low',
    status: 'todo',
    impact_points: 4,
    due_date: null,
    completed_at: null,
    notes: null,
    sort_order: 60,
    evidence_count: 0,
    created_at: '2026-07-01T12:00:00Z',
    updated_at: '2026-07-01T12:00:00Z',
  },
]

const fallbackOverview = {
  score: 82,
  label: 'Funding ready',
  verification_percent: 100,
  credit_health_percent: 75,
  cash_flow_percent: 80,
  public_records_percent: 90,
  funding_profile_percent: 85,
  last_scored_at: '2026-07-01T12:00:00Z',
  roadmap: fallbackActions,
  checklist: [
    { label: 'Business Verification', value: '100%' },
    { label: 'Credit Health', value: '75%' },
    { label: 'Cash Flow Stability', value: '80%' },
    { label: 'Public Records', value: '90%' },
    { label: 'Funding Profile', value: '85%' },
  ],
}

const fallbackActionPlan = {
  total: fallbackActions.length,
  completed_count: 3,
  in_progress_count: 1,
  todo_count: 2,
  available_impact_points: 15,
  missing_document_count: 3,
  estimated_weeks: 2,
  items: fallbackActions,
}

export const credtrackRepository = {
  async getOverview(token) {
    if (!token) {
      return presentationDataOrThrow(token, fallbackOverview, null, 'CredTrack data requires an authenticated account.')
    }

    try {
      return await httpClient.get(apiEndpoints.credtrack.overview, { token })
    } catch (error) {
      console.error('Failed to fetch CredTrack overview:', error)
      return presentationDataOrThrow(token, fallbackOverview, error)
    }
  },

  async getActionPlan(token) {
    if (!token) {
      return presentationDataOrThrow(token, fallbackActionPlan, null, 'CredTrack data requires an authenticated account.')
    }

    try {
      return await httpClient.get(apiEndpoints.credtrack.actionPlan, { token })
    } catch (error) {
      console.error('Failed to fetch CredTrack action plan:', error)
      return presentationDataOrThrow(token, fallbackActionPlan, error)
    }
  },

  async updateAction(token, actionId, payload) {
    return httpClient.patch(apiEndpoints.credtrack.actionById(actionId), payload, { token })
  },
}

export default credtrackRepository
