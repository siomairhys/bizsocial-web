import { apiEndpoints } from './apiEndpoints'
import { httpClient } from '../services/httpClient'
import { defaultPitchReels } from '../data/defaultSeedData'
import { presentationDataOrThrow } from '../services/presentationData'

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

function mapPitchReelCard(item, { interactionEnabled = true } = {}) {
  const first = item.author_first_name || ''
  const last = item.author_last_name || ''

  return {
    id: item.id,
    authorUserId: Number(item.author_user_id || item.authorUserId || 0),
    authorName: [first, last].filter(Boolean).join(' ') || item.authorName || item.author_business_name || 'BizSocials Member',
    authorAvatarUrl: item.author_avatar_url || item.authorAvatarUrl || '',
    initials: `${first[0] || ''}${last[0] || ''}`.toUpperCase() || item.initials || 'BS',
    title: item.title || 'Untitled pitch reel',
    subtitle: item.caption || item.category || 'Pitch reel',
    caption: item.caption || item.subtitle || '',
    category: item.category || '',
    visibility: item.visibility || 'public',
    status: item.status || 'active',
    isBizQuest: Boolean(item.is_bizquest || item.isBizQuest),
    tags: Array.isArray(item.tags) ? item.tags : [],
    createdAt: item.created_at || item.createdAt || null,
    likes: Number(item.reactions_count || 0),
    comments: Number(item.comments_count || 0),
    shares: Number(item.shares_count || 0),
    views: Number(item.views_count || 0),
    viewerReacted: Boolean(item.viewer_reacted),
    interactionEnabled,
    gradient: item.gradient || 'from-[#8db0df] via-[#7c96ca] to-[#6779b4]',
    coverImageUrl:
      item.cover_media?.download_url ||
      item.cover_media?.url ||
      item.coverImageUrl ||
      item.cover_image_url ||
      item.cover_url ||
      item.thumbnail_url ||
      '',
    primaryVideoUrl:
      item.primary_media?.download_url ||
      item.primary_media?.url ||
      item.primaryVideoUrl ||
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
          items: Array.isArray(payload?.items)
            ? payload.items.map((item) => mapPitchReelCard(item, { interactionEnabled: true }))
            : [],
        }
      } catch (error) {
        return presentationDataOrThrow(token, {
          endpoint: PITCH_REELS_ENDPOINT_PLACEHOLDER,
          source: 'static',
          items: filterByTab(STATIC_PITCH_REELS, tab).map((item) =>
            mapPitchReelCard(item, { interactionEnabled: false }),
          ),
        }, error)
      }
    }

    return presentationDataOrThrow(token, {
      endpoint: PITCH_REELS_ENDPOINT_PLACEHOLDER,
      source: 'static',
      items: filterByTab(STATIC_PITCH_REELS, tab).map((item) =>
        mapPitchReelCard(item, { interactionEnabled: false }),
      ),
    }, null, 'Pitch Reels API is disabled for this account.')
  },

  async saveDraft(token, payload) {
    const normalized = normalizePitchReelPayload(payload)

    if (ENABLE_PITCH_REELS_API) {
      return httpClient.put(apiEndpoints.pitchReels.draftMe, normalized, { token })
    }

    return presentationDataOrThrow(token, {
      endpoint: PITCH_REELS_DRAFT_ENDPOINT_PLACEHOLDER,
      source: 'static',
      message: 'Pitch reel draft saved locally (placeholder).',
      draft: {
        ...normalized,
        updated_at: new Date().toISOString(),
      },
    }, null, 'Pitch Reel drafts require the live API.')
  },

  async getDraft(token) {
    if (ENABLE_PITCH_REELS_API) {
      return httpClient.get(apiEndpoints.pitchReels.draftMe, { token })
    }

    return presentationDataOrThrow(token, null, null, 'Pitch Reel drafts require the live API.')
  },

  async deleteDraft(token) {
    if (ENABLE_PITCH_REELS_API) {
      return httpClient.delete(apiEndpoints.pitchReels.draftMe, { token })
    }

    return presentationDataOrThrow(token, {
      endpoint: PITCH_REELS_DRAFT_ENDPOINT_PLACEHOLDER,
      source: 'static',
      success: true,
      message: 'Pitch reel draft deleted locally (placeholder).',
    }, null, 'Pitch Reel drafts require the live API.')
  },

  async publish(token, payload) {
    const normalized = normalizePitchReelPayload(payload)

    if (ENABLE_PITCH_REELS_API) {
      return httpClient.post(apiEndpoints.pitchReels.create, normalized, { token })
    }

    return presentationDataOrThrow(token, {
      endpoint: PITCH_REELS_PUBLISH_ENDPOINT_PLACEHOLDER,
      source: 'static',
      id: `pitch-${Date.now()}`,
      status: 'published',
      ...normalized,
    }, null, 'Publishing Pitch Reels requires the live API.')
  },

  async get(token, pitchReelId) {
    if (ENABLE_PITCH_REELS_API) {
      try {
        const item = await httpClient.get(apiEndpoints.pitchReels.byId(pitchReelId), { token })
        return mapPitchReelCard(item, { interactionEnabled: true })
      } catch (error) {
        const fallback = STATIC_PITCH_REELS.find(
          (item) => String(item.id) === String(pitchReelId),
        )
        return presentationDataOrThrow(
          token,
          fallback ? mapPitchReelCard(fallback, { interactionEnabled: false }) : null,
          error,
        )
      }
    }

    const fallback = STATIC_PITCH_REELS.find(
      (item) => String(item.id) === String(pitchReelId),
    )
    return presentationDataOrThrow(
      token,
      fallback ? mapPitchReelCard(fallback, { interactionEnabled: false }) : null,
      null,
      'Pitch Reel details require the live API.',
    )
  },

  async getInteractions(token, pitchReelId) {
    return httpClient.get(apiEndpoints.pitchReels.interactions(pitchReelId), { token })
  },

  async toggleReaction(token, pitchReelId, reactionType = 'like') {
    return httpClient.post(
      apiEndpoints.pitchReels.reactions(pitchReelId),
      { reaction_type: reactionType },
      { token },
    )
  },

  async listComments(token, pitchReelId, { limit = 100, offset = 0 } = {}) {
    return httpClient.get(
      `${apiEndpoints.pitchReels.comments(pitchReelId)}?limit=${limit}&offset=${offset}`,
      { token },
    )
  },

  async createComment(token, pitchReelId, body, parentCommentId = null) {
    return httpClient.post(
      apiEndpoints.pitchReels.comments(pitchReelId),
      { body: String(body || '').trim(), parent_comment_id: parentCommentId },
      { token },
    )
  },

  async deleteComment(token, pitchReelId, commentId) {
    return httpClient.delete(
      apiEndpoints.pitchReels.commentById(pitchReelId, commentId),
      { token },
    )
  },

  async createShare(token, pitchReelId, { shareType = 'copy_link', shareText = null } = {}) {
    return httpClient.post(
      apiEndpoints.pitchReels.shares(pitchReelId),
      { share_type: shareType, share_text: shareText },
      { token },
    )
  },

  async recordView(token, pitchReelId, { watchDurationSeconds = 0, completed = false } = {}) {
    return httpClient.post(
      apiEndpoints.pitchReels.views(pitchReelId),
      { watch_duration_seconds: watchDurationSeconds, completed },
      { token },
    )
  },

  async createReport(token, pitchReelId, { reason, details = null }) {
    return httpClient.post(
      apiEndpoints.pitchReels.reports(pitchReelId),
      { reason, details },
      { token },
    )
  },
}
