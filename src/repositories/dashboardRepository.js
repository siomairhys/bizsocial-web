import { apiEndpoints } from './apiEndpoints'
import { httpClient } from '../services/httpClient'

function numberWithCommas(value) {
  return Number(value || 0).toLocaleString()
}

function asCurrency(value) {
  return `$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

function toRelativeTime(isoValue) {
  if (!isoValue) {
    return 'now'
  }

  const then = new Date(isoValue).getTime()
  const now = Date.now()
  const diffMinutes = Math.max(1, Math.floor((now - then) / (1000 * 60)))

  if (diffMinutes < 60) {
    return `${diffMinutes}m`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours}h`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d`
}

function mapActivityIcon(action) {
  if (!action) {
    return 'Activity'
  }

  if (action.includes('follow')) {
    return 'Users2'
  }

  if (action.includes('login')) {
    return 'Check'
  }

  if (action.includes('profile')) {
    return 'UserRound'
  }

  return 'Bell'
}

function formatEventDate(dateValue) {
  if (!dateValue) {
    return { month: 'N/A', day: '--', date: 'No date', time: 'TBD' }
  }

  const parsed = new Date(dateValue)
  const month = parsed.toLocaleString(undefined, { month: 'short' }).toUpperCase()
  const day = parsed.toLocaleString(undefined, { day: '2-digit' })
  const date = parsed.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const time = parsed.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })

  return { month, day, date, time }
}

function mapOverview(payload) {
  const summary = payload?.summary || {}
  const campaign = payload?.campaign_progress?.[0] || null

  const metrics = [
    {
      label: 'Profile Views',
      value: numberWithCommas(summary.profile_views),
      trend: null,
      icon: 'Eye',
    },
    {
      label: 'Followers',
      value: numberWithCommas(summary.followers),
      trend: null,
      icon: 'Users2',
    },
    {
      label: 'Engagement',
      value: `${Number(summary.engagement_rate || 0).toFixed(1)}%`,
      trend: null,
      icon: 'Heart',
    },
    {
      label: 'Funding Raised',
      value: asCurrency(summary.funding_raised),
      trend: null,
      icon: 'CircleDollarSign',
      accent: 'green',
    },
  ]

  const recentActivity = (payload?.recent_activity || []).map((item, index) => ({
    text: item.title || item.description || '',
    time: toRelativeTime(item.occurred_at),
    icon: mapActivityIcon(item.action),
    key: item.id || `${item.action || 'activity'}-${index}`,
  }))

  const upcomingEvents = (payload?.upcoming_events || []).map((event) => {
    const formatted = formatEventDate(event.start_at)
    return {
      month: formatted.month,
      day: formatted.day,
      title: event.title || '',
      date: formatted.date,
      time: formatted.time,
      location: event.location || '',
      attendees: Number(event.attendees || 0),
      role: event.role,
      eventId: event.event_id,
    }
  })

  const messages = (payload?.messages_preview || []).map((item) => ({
    name: item.conversation_title || '',
    message: item.last_message_body || '',
    time: toRelativeTime(item.last_message_at),
    unread: Number(item.unread_count || 0),
  }))

  const balanceSummary = {
    bizbucksBalance: Number(summary.bizbucks_balance || 0),
    fundingReadiness: summary.funding_readiness != null ? Number(summary.funding_readiness) : null,
    fundingReadinessLabel: summary.funding_readiness_label || null,
  }

  const campaignSummary = campaign
    ? {
        title: campaign.title,
        description: 'Campaign performance overview',
        raisedAmount: Number(campaign.raised_amount || 0),
        goalAmount: Number(campaign.goal_amount || 0),
        progressPercent: Number(campaign.progress_percent || 0),
        supporters: Number(campaign.supporter_count || 0),
        status: campaign.status,
      }
    : null

  return {
    metrics,
    recentActivity,
    upcomingEvents,
    messages,
    balanceSummary,
    campaignSummary,
    credTrack: payload?.credtrack_summary || null,
    topGroups: payload?.top_groups || [],
    learningCourses: payload?.learning_hub || [],
    marketplaceProducts: payload?.marketplace_spotlight || [],
    sponsors: payload?.sponsors || [],
    challenge: payload?.bizquest_challenge || null,
  }
}

export const dashboardRepository = {
  async getOverview(token) {
    const payload = await httpClient.get(apiEndpoints.dashboard.overview, { token })
    return mapOverview(payload)
  },
}
