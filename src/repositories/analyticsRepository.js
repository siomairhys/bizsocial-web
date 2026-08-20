import { httpClient } from '../services/httpClient'
import { apiEndpoints } from './apiEndpoints'
import { presentationDataOrThrow } from '../services/presentationData'

const fallbackGrowth = Array.from({ length: 10 }, (_, index) => ({
  date: `2026-07-${String(index + 1).padStart(2, '0')}`,
  followers: 1200 + index * 34,
  engagement: 80 + index * 8,
  funding_activity: 420 + index * 115,
}))

const fallbackTopContent = [
  {
    id: 1,
    user_id: 1,
    content_type: 'post',
    content_id: 1001,
    title: 'Design that drives growth',
    views_count: 2840,
    engagement_rate: 8.6,
    reactions_count: 184,
    comments_count: 42,
    shares_count: 31,
    amount_value: 0,
    deep_link: '/feed',
    last_activity_at: '2026-07-12T12:00:00Z',
    created_at: '2026-07-01T12:00:00Z',
    updated_at: '2026-07-12T12:00:00Z',
  },
  {
    id: 2,
    user_id: 1,
    content_type: 'campaign',
    content_id: 1002,
    title: 'Studio growth fund update',
    views_count: 1960,
    engagement_rate: 7.4,
    reactions_count: 122,
    comments_count: 28,
    shares_count: 19,
    amount_value: 24850,
    deep_link: '/fundme',
    last_activity_at: '2026-07-12T12:00:00Z',
    created_at: '2026-07-01T12:00:00Z',
    updated_at: '2026-07-12T12:00:00Z',
  },
  {
    id: 3,
    user_id: 1,
    content_type: 'pitch_reel',
    content_id: 1003,
    title: 'My BizDrop Challenge',
    views_count: 2420,
    engagement_rate: 9.2,
    reactions_count: 212,
    comments_count: 55,
    shares_count: 46,
    amount_value: 0,
    deep_link: '/pitch-reels',
    last_activity_at: '2026-07-12T12:00:00Z',
    created_at: '2026-07-01T12:00:00Z',
    updated_at: '2026-07-12T12:00:00Z',
  },
]

const fallbackOverview = {
  period: 'last_30_days',
  metrics: {
    profile_views: { value: 3482, trend_percent: 12.6 },
    pitch_reel_views: { value: 12900, trend_percent: 24.8 },
    new_followers: { value: 426, trend_percent: 8.4 },
    funding_activity: { value: 24850, trend_percent: 18.7 },
  },
  audience_growth: fallbackGrowth,
  top_content: fallbackTopContent,
  audience_insights: {
    entrepreneurs: 44,
    creators: 28,
    funders: 16,
  },
}

const fallbackContent = {
  limit: 10,
  offset: 0,
  total: fallbackTopContent.length,
  items: fallbackTopContent,
}

function fallbackExport(period = 'last_30_days') {
  return {
    period,
    report_name: `bizsocials-analytics-${period}.json`,
    generated_at: new Date().toISOString(),
    rows: [
      { section: 'metric', metric_key: 'profile_views', label: 'Profile Views', value_number: 3482 },
      { section: 'metric', metric_key: 'pitch_reel_views', label: 'Pitch Reel Views', value_number: 12900 },
      { section: 'metric', metric_key: 'new_followers', label: 'New Followers', value_number: 426 },
      { section: 'metric', metric_key: 'funding_activity', label: 'Funding Activity', value_number: 24850 },
    ],
  }
}

export const analyticsRepository = {
  async getOverview(token, { period = 'last_30_days' } = {}) {
    if (!token) {
      return presentationDataOrThrow(token, { ...fallbackOverview, period }, null, 'Analytics requires an authenticated account.')
    }

    try {
      return await httpClient.get(`${apiEndpoints.analytics.overview}?period=${encodeURIComponent(period)}`, { token })
    } catch (error) {
      console.error('Failed to fetch analytics overview:', error)
      return presentationDataOrThrow(token, { ...fallbackOverview, period }, error)
    }
  },

  async getContent(token, { limit = 10, offset = 0 } = {}) {
    if (!token) {
      return presentationDataOrThrow(token, { ...fallbackContent, limit, offset }, null, 'Analytics requires an authenticated account.')
    }

    try {
      return await httpClient.get(`${apiEndpoints.analytics.content}?limit=${limit}&offset=${offset}`, { token })
    } catch (error) {
      console.error('Failed to fetch analytics content:', error)
      return presentationDataOrThrow(token, { ...fallbackContent, limit, offset }, error)
    }
  },

  async exportReport(token, { period = 'last_30_days' } = {}) {
    if (!token) {
      return presentationDataOrThrow(token, () => fallbackExport(period), null, 'Analytics export requires an authenticated account.')
    }

    try {
      return await httpClient.get(`${apiEndpoints.analytics.export}?period=${encodeURIComponent(period)}`, { token })
    } catch (error) {
      console.error('Failed to export analytics report:', error)
      return presentationDataOrThrow(token, () => fallbackExport(period), error)
    }
  },
}

export default analyticsRepository
