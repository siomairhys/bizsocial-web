import { apiEndpoints } from './apiEndpoints'
import { httpClient } from '../services/httpClient'
import {
  defaultFundMeActivity,
  defaultFundMeCampaignDetails,
  defaultFundMeCampaigns,
  defaultFundMeFeatured,
} from '../data/defaultSeedData'

const ENABLE_FUNDME_API =
  (import.meta.env.VITE_ENABLE_FUNDME_API || 'false').toLowerCase() === 'true'

const staticCampaigns = defaultFundMeCampaigns

const staticFeatured = defaultFundMeFeatured
const staticActivity = defaultFundMeActivity

const staticDetails = defaultFundMeCampaignDetails

function mapFundedPercent(raised, goal) {
  if (!goal) {
    return 0
  }
  return Math.max(0, Math.min(Math.round((Number(raised || 0) / Number(goal || 1)) * 100), 100))
}

function mapCampaignCard(item) {
  const raised = Number(item?.raised_amount || item?.raised || 0)
  const goal = Number(item?.goal_amount || item?.goal || 0)
  const fundedPercent = mapFundedPercent(raised, goal)

  return {
    id: String(item.id),
    title: String(item.title || 'FundMe Campaign'),
    subtitle: String(item.summary || item.subtitle || 'Campaign summary coming soon.'),
    fundedPercent,
    raisedLabel: `$${raised.toLocaleString()} raised`,
    raised,
    goal,
    accent: 'bg-blue-600',
    surface: 'from-[#dbe2f7] to-[#c2cde8]',
    daysLeft: Number(item.days_left || 0),
    supporters: Number(item.supporters_count || 0),
    imageUrl: item.imageUrl || item.image_url || item.cover_image_url || item.cover_url || '',
  }
}

function mapActivityItem(item) {
  return {
    id: String(item?.id || ''),
    text: String(item?.activity_text || item?.text || 'Campaign activity'),
    at: item?.created_at ? String(item.created_at) : String(item?.at || ''),
  }
}

export const fundmeRepository = {
  listCampaignsApi(token, { tab = 'discover', limit = 20, offset = 0 } = {}) {
    if (tab === 'my-campaigns') {
      return httpClient.get(`${apiEndpoints.fundme.myCampaigns}?limit=${limit}&offset=${offset}`, { token })
    }
    if (tab === 'supported') {
      return httpClient.get(`${apiEndpoints.fundme.supported}?limit=${limit}&offset=${offset}`, { token })
    }
    if (tab === 'following') {
      return httpClient.get(`${apiEndpoints.fundme.following}?limit=${limit}&offset=${offset}`, { token })
    }

    return httpClient.get(`${apiEndpoints.fundme.list}?tab=${encodeURIComponent(tab)}&limit=${limit}&offset=${offset}`, { token })
  },

  getCampaignDetailApi(token, campaignId) {
    return httpClient.get(apiEndpoints.fundme.byId(campaignId), { token })
  },

  contributeApi(token, campaignId, payload) {
    return httpClient.post(apiEndpoints.fundme.contribute(campaignId), payload, { token })
  },

  createCampaignApi(token, payload) {
    return httpClient.post(apiEndpoints.fundme.list, payload, { token })
  },

  updateCampaignApi(token, campaignId, payload) {
    return httpClient.patch(apiEndpoints.fundme.byId(campaignId), payload, { token })
  },

  createCampaignUpdateApi(token, campaignId, payload) {
    return httpClient.post(`${apiEndpoints.fundme.byId(campaignId)}/updates`, payload, { token })
  },

  activityApi(token, { limit = 10 } = {}) {
    return httpClient.get(`${apiEndpoints.fundme.activity}?limit=${limit}`, { token })
  },

  async getOverview({ token, tab = 'discover' } = {}) {
    if (ENABLE_FUNDME_API && token) {
      const [list, activity] = await Promise.all([
        this.listCampaignsApi(token, { tab, limit: 20, offset: 0 }),
        this.activityApi(token, { limit: 10 }),
      ])

      const items = Array.isArray(list?.items) ? list.items.map(mapCampaignCard) : []
      const activityItems = Array.isArray(activity?.items) ? activity.items.map(mapActivityItem) : []

      return {
        source: 'api',
        tabs: ['discover', 'my-campaigns', 'supported', 'following'],
        campaigns: items,
        featured: staticFeatured,
        activity: activityItems,
      }
    }

    return {
      source: 'static',
      tabs: ['discover', 'my-campaigns', 'supported', 'following'],
      campaigns: staticCampaigns,
      featured: staticFeatured,
      activity: staticActivity,
    }
  },

  async getCampaignDetail({ token, campaignId } = {}) {
    if (ENABLE_FUNDME_API && token) {
      const detail = await this.getCampaignDetailApi(token, campaignId)
      const raised = Number(detail?.raised_amount || 0)
      const goal = Number(detail?.goal_amount || 0)
      return {
        source: 'api',
        id: String(detail.id),
        ownerUserId: Number(detail.owner_user_id || 0),
        title: String(detail.title || 'Campaign Detail'),
        subtitle: String(detail.summary || ''),
        ownerName: String(detail.owner_name || 'Campaign Owner'),
        ownerMeta: String(detail.owner_meta || ''),
        progressPercent: mapFundedPercent(raised, goal),
        raised,
        goal,
        supporters: Number(detail.supporters_count || 0),
        daysLeft: Number(detail.days_left || 0),
        summary: String(detail.summary || ''),
        imageUrl: detail.image_url || detail.cover_image_url || detail.cover_url || '',
        ownerAvatarUrl: detail.owner_avatar_url || '',
        updates: Array.isArray(detail.updates) ? detail.updates : [],
        suggestedContributions: Array.isArray(detail.suggested_contributions)
          ? detail.suggested_contributions
          : staticDetails['1'].suggestedContributions,
      }
    }

    return staticDetails[String(campaignId)] || staticDetails['1']
  },
}
