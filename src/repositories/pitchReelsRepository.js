import { apiEndpoints } from './apiEndpoints'
import { httpClient } from '../services/httpClient'
import { defaultPitchReels } from '../data/defaultSeedData'

const ENABLE_PITCH_REELS_API =
  (import.meta.env.VITE_ENABLE_PITCH_REELS_API || 'true').toLowerCase() !== 'false'
const DEFAULT_VISIBILITY = 'public'

export const PITCH_REELS_ENDPOINT_PLACEHOLDER = apiEndpoints.pitchReels.list
export const PITCH_REELS_DRAFT_ENDPOINT_PLACEHOLDER = apiEndpoints.pitchReels.draftMe
export const PITCH_REELS_PUBLISH_ENDPOINT_PLACEHOLDER = apiEndpoints.pitchReels.create

const STATIC_PITCH_REELS = defaultPitchReels

function toUniqueTags(values) {
  const seen = new Set()
  const output = []

  ;(values || []).forEach((value) => {
    const cleaned = String(value || '').replace(/^#+/, '').trim()
    if (!cleaned) {
      return
    }

    const key = cleaned.toLowerCase()
    if (seen.has(key)) {
      return
    }

    seen.add(key)
    output.push(cleaned)
  })

  return output
}

function normalizePitchReelPayload(payload = {}) {
  return {
    title: String(payload.title || '').trim(),
    caption: String(payload.caption || '').trim() || null,
    category: String(payload.category || '').trim() || null,
    visibility: payload.visibility || DEFAULT_VISIBILITY,
    primary_media_id: payload.primary_media_id || null,
    cover_media_id: payload.cover_media_id || null,
    tags: toUniqueTags(payload.tags),
    is_bizquest: Boolean(payload.is_bizquest),
  }
}

function mapPitchReelCard(item) {
  const first = item.author_first_name || ''
  const last = item.author_last_name || ''

  return {
    id: item.id,
    authorName: [first, last].filter(Boolean).join(' ') || item.author_business_name || 'BizSocials Member',
    initials: `${first[0] || ''}${last[0] || ''}`.toUpperCase() || 'BS',
    title: item.title || 'Untitled pitch reel',
    subtitle: item.caption || item.category || 'Pitch reel',
    likes: Number(item.reactions_count || 0),
    comments: Number(item.comments_count || 0),
    shares: Number(item.shares_count || 0),
    gradient: item.gradient || 'from-[#8db0df] via-[#7c96ca] to-[#6779b4]',
    coverImageUrl:
      item.coverImageUrl ||
      item.cover_image_url ||
      item.cover_url ||
      item.thumbnail_url ||
      item.media_url ||
      '',
  }
}

function filterByTab(items, tab) {
  if (tab === 'top') {
    return items
  }

  if (tab === 'bizquest') {
    return items.filter((item) => String(item.caption || '').toLowerCase().includes('pitch'))
  }

  return items.filter((item) => item.tab === tab)
}

export const pitchReelsRepository = {
  async list(token, { tab = 'top' } = {}) {
    if (ENABLE_PITCH_REELS_API) {
      try {
        const payload = await httpClient.get(`${apiEndpoints.pitchReels.list}?tab=${encodeURIComponent(tab)}`, { token })
        return {
          endpoint: PITCH_REELS_ENDPOINT_PLACEHOLDER,
          source: 'api',
          items: Array.isArray(payload?.items) ? payload.items.map(mapPitchReelCard) : [],
        }
      } catch {
        return {
          endpoint: PITCH_REELS_ENDPOINT_PLACEHOLDER,
          source: 'static',
          items: filterByTab(STATIC_PITCH_REELS, tab).map(mapPitchReelCard),
        }
      }
    }

    return {
      endpoint: PITCH_REELS_ENDPOINT_PLACEHOLDER,
      source: 'static',
      items: filterByTab(STATIC_PITCH_REELS, tab).map(mapPitchReelCard),
    }
  },

  async saveDraft(token, payload) {
    const normalized = normalizePitchReelPayload(payload)

    if (ENABLE_PITCH_REELS_API) {
      return httpClient.put(apiEndpoints.pitchReels.draftMe, normalized, { token })
    }

    return {
      endpoint: PITCH_REELS_DRAFT_ENDPOINT_PLACEHOLDER,
      source: 'static',
      message: 'Pitch reel draft saved locally (placeholder).',
      draft: {
        ...normalized,
        updated_at: new Date().toISOString(),
      },
    }
  },

  async getDraft(token) {
    if (ENABLE_PITCH_REELS_API) {
      return httpClient.get(apiEndpoints.pitchReels.draftMe, { token })
    }

    return null
  },

  async deleteDraft(token) {
    if (ENABLE_PITCH_REELS_API) {
      return httpClient.delete(apiEndpoints.pitchReels.draftMe, { token })
    }

    return {
      endpoint: PITCH_REELS_DRAFT_ENDPOINT_PLACEHOLDER,
      source: 'static',
      success: true,
      message: 'Pitch reel draft deleted locally (placeholder).',
    }
  },

  async publish(token, payload) {
    const normalized = normalizePitchReelPayload(payload)

    if (ENABLE_PITCH_REELS_API) {
      return httpClient.post(apiEndpoints.pitchReels.create, normalized, { token })
    }

    return {
      endpoint: PITCH_REELS_PUBLISH_ENDPOINT_PLACEHOLDER,
      source: 'static',
      id: `pitch-${Date.now()}`,
      status: 'published',
      ...normalized,
    }
  },
}
