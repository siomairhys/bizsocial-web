import { httpClient } from '../services/httpClient'
import { apiEndpoints } from './apiEndpoints'

const fallbackOverview = {
  period: 'last_30_days',
  metrics: {
    founders_supported: { value: 300, trend_percent: 44 },
    campaign_reach: { value: 82000, trend_percent: 29 },
    funding_facilitated: { value: 240000, trend_percent: 18 },
    active_sponsors: { value: 21, trend_percent: 8 },
  },
  founder_outcomes: [
    { outcome_key: 'pitch_readiness_unlocked', label: 'Pitch readiness unlocked', value: 120, trend_percent: 12 },
    { outcome_key: 'funding_profiles_completed', label: 'Funding profile completed', value: 96, trend_percent: 10 },
    { outcome_key: 'workshops_attended', label: 'Capital access workshop attended', value: 84, trend_percent: 15 },
  ],
  featured_founder_stories: [
    {
      id: 1,
      user_id: 1,
      display_name: 'Alicia Moore',
      business_name: 'AM Studio',
      milestone: 'Pitch readiness unlocked',
      event_type: 'pitch_ready',
      event_value: 1,
      campaign_id: 1,
      campaign_slug: 'underserved-business-credit-access',
      campaign_title: 'Underserved Business Credit Access',
      sponsor_name: 'Fundable Futures',
      event_at: '2026-07-12T12:00:00Z',
    },
    {
      id: 2,
      user_id: 2,
      display_name: 'David Chen',
      business_name: 'Next Invest Network',
      milestone: 'Funding profile completed',
      event_type: 'funding_profile_completed',
      event_value: 1,
      campaign_id: 2,
      campaign_slug: 'pitch-readiness-accelerator',
      campaign_title: 'Pitch Readiness Accelerator',
      sponsor_name: 'Next Invest',
      event_at: '2026-07-11T12:00:00Z',
    },
    {
      id: 3,
      user_id: 3,
      display_name: 'Tanya Grant',
      business_name: 'Grant Luxury',
      milestone: 'Capital access workshop attended',
      event_type: 'workshop_attended',
      event_value: 1,
      campaign_id: 3,
      campaign_slug: 'founder-storytelling-lift',
      campaign_title: 'Founder Storytelling Lift',
      sponsor_name: 'Excel Media Co',
      event_at: '2026-07-10T12:00:00Z',
    },
  ],
}

const fallbackCampaigns = {
  status: 'active',
  limit: 20,
  offset: 0,
  total: 3,
  items: [
    {
      id: 1,
      sponsor_account_id: 1,
      sponsor_name: 'Fundable Futures',
      sponsor_slug: 'fundable-futures',
      sponsor_tier: 'title',
      slug: 'underserved-business-credit-access',
      title: 'Underserved Business Credit Access',
      description: 'Helping founders improve funding readiness and lender visibility.',
      status: 'active',
      starts_at: '2026-07-01T00:00:00Z',
      ends_at: '2026-09-30T23:59:59Z',
      budget_amount: 125000,
      currency: 'USD',
      target_founders: 350,
      target_reach: 90000,
      target_funding_amount: 250000,
      founders_supported: 300,
      campaign_reach: 82000,
      funding_facilitated: 240000,
      pitch_readiness_unlocked: 120,
      founder_progress_percent: 86,
      reach_progress_percent: 91,
      created_at: '2026-07-01T00:00:00Z',
      updated_at: '2026-07-12T12:00:00Z',
    },
    {
      id: 2,
      sponsor_account_id: 2,
      sponsor_name: 'Next Invest',
      sponsor_slug: 'next-invest',
      sponsor_tier: 'platinum',
      slug: 'pitch-readiness-accelerator',
      title: 'Pitch Readiness Accelerator',
      description: 'Supporting pitch reel creation, coaching, and live showcase access.',
      status: 'active',
      starts_at: '2026-07-01T00:00:00Z',
      ends_at: '2026-08-31T23:59:59Z',
      budget_amount: 85000,
      currency: 'USD',
      target_founders: 220,
      target_reach: 65000,
      target_funding_amount: 175000,
      founders_supported: 184,
      campaign_reach: 52000,
      funding_facilitated: 158000,
      pitch_readiness_unlocked: 118,
      founder_progress_percent: 84,
      reach_progress_percent: 80,
      created_at: '2026-07-01T00:00:00Z',
      updated_at: '2026-07-12T12:00:00Z',
    },
  ],
}

function fallbackExport(period = 'last_30_days') {
  return {
    period,
    report_name: `bizsocials-sponsor-impact-${period}.json`,
    generated_at: new Date().toISOString(),
    rows: [
      { section: 'metric', metric_key: 'founders_supported', label: 'Founders Supported', value_number: 300 },
      { section: 'metric', metric_key: 'campaign_reach', label: 'Campaign Reach', value_number: 82000 },
      { section: 'metric', metric_key: 'funding_facilitated', label: 'Funding Facilitated', value_number: 240000 },
    ],
  }
}

export const sponsorImpactRepository = {
  async getOverview(token, { period = 'last_30_days' } = {}) {
    if (!token) {
      return { ...fallbackOverview, period }
    }

    try {
      return await httpClient.get(`${apiEndpoints.sponsorImpact.overview}?period=${encodeURIComponent(period)}`, { token })
    } catch (error) {
      console.error('Failed to fetch sponsor impact overview:', error)
      return { ...fallbackOverview, period }
    }
  },

  async listCampaigns(token, { status = 'active', limit = 20, offset = 0 } = {}) {
    if (!token) {
      return { ...fallbackCampaigns, status, limit, offset }
    }

    try {
      return await httpClient.get(`${apiEndpoints.sponsorImpact.campaigns}?status=${encodeURIComponent(status)}&limit=${limit}&offset=${offset}`, { token })
    } catch (error) {
      console.error('Failed to fetch sponsor campaigns:', error)
      return { ...fallbackCampaigns, status, limit, offset }
    }
  },

  async exportReport(token, { period = 'last_30_days' } = {}) {
    if (!token) {
      return fallbackExport(period)
    }

    try {
      return await httpClient.get(`${apiEndpoints.sponsorImpact.export}?period=${encodeURIComponent(period)}`, { token })
    } catch (error) {
      console.error('Failed to export sponsor impact report:', error)
      return fallbackExport(period)
    }
  },
}

export default sponsorImpactRepository
