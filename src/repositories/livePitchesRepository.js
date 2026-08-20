import { apiEndpoints } from './apiEndpoints'
import { httpClient } from '../services/httpClient'
import { defaultLivePitchSession, defaultLivePitchesOverview } from '../data/defaultSeedData'
import { presentationDataOrThrow } from '../services/presentationData'

export const LIVE_PITCHES_LIST_ENDPOINT_PLACEHOLDER = apiEndpoints.livePitches.list
export const LIVE_PITCHES_VOTE_ENDPOINT_PLACEHOLDER = apiEndpoints.livePitches.vote(':livePitchId')
export const LIVE_PITCHES_FUND_ENDPOINT_PLACEHOLDER = apiEndpoints.livePitches.fund(':livePitchId')
export const LIVE_PITCHES_CHAT_ENDPOINT_PLACEHOLDER = apiEndpoints.livePitches.chat(':livePitchId')

const ENABLE_LIVE_PITCHES_API =
  (import.meta.env.VITE_ENABLE_LIVE_PITCHES_API || 'false').toLowerCase() === 'true'

const staticOverview = defaultLivePitchesOverview

const BATTLE_ACCENTS = ['bg-blue-600', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500']

function formatScheduleParts(value) {
  const parsed = value ? new Date(value) : null
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return {
      date: 'TBA',
      time: 'TBA',
    }
  }

  return {
    date: parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    time: parsed.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  }
}

function mapUpcomingSession(item) {
  const schedule = formatScheduleParts(item?.scheduled_start_at)
  return {
    id: `u-${item.id}`,
    sessionId: Number(item.id),
    title: String(item.title || 'Upcoming Live Pitch'),
    date: schedule.date,
    time: schedule.time,
  }
}

function mapBattlesFromLeaderboard(items = []) {
  return items.slice(0, 4).map((item, index) => ({
    id: `b-${item.id}`,
    name: String(item.display_name || 'Pitch Entry'),
    score: Number(item.score || 0),
    accent: BATTLE_ACCENTS[index % BATTLE_ACCENTS.length],
  }))
}

function toOverviewUiPayload(apiListResponse, leaderboardItems = []) {
  const sessions = Array.isArray(apiListResponse?.items) ? apiListResponse.items : []
  const liveSession =
    sessions.find((session) => String(session?.status || '').toLowerCase() === 'live') ||
    sessions[0]

  if (!liveSession) {
    return {
      event: {
        id: 'lp-none',
        sessionId: null,
        title: 'No live sessions available',
        watching: 0,
        ctaLabel: 'Watch Live Pitch',
      },
      battles: [],
      upcoming: [],
    }
  }

  const upcomingSessions = sessions
    .filter((session) => {
      if (!liveSession) {
        return true
      }
      return Number(session.id) !== Number(liveSession.id)
    })
    .slice(0, 6)
    .map(mapUpcomingSession)

  return {
    event: {
      id: `lp-${liveSession.id}`,
      sessionId: Number(liveSession.id),
      title: String(liveSession?.title || 'Live Pitch Session'),
      watching: Number(liveSession?.watching_count || 0),
      ctaLabel: 'Watch Live Pitch',
      imageUrl: liveSession?.image_url || liveSession?.cover_image_url || '',
    },
    battles: mapBattlesFromLeaderboard(leaderboardItems),
    upcoming: upcomingSessions,
  }
}

const staticSession = defaultLivePitchSession

function getStaticOverviewPayload() {
  return {
    source: 'static',
    endpoint: LIVE_PITCHES_LIST_ENDPOINT_PLACEHOLDER,
    ...staticOverview,
  }
}

function getStaticSessionPayload() {
  return {
    source: 'static',
    byIdEndpoint: apiEndpoints.livePitches.byId(':livePitchId'),
    voteEndpoint: LIVE_PITCHES_VOTE_ENDPOINT_PLACEHOLDER,
    fundEndpoint: LIVE_PITCHES_FUND_ENDPOINT_PLACEHOLDER,
    chatEndpoint: LIVE_PITCHES_CHAT_ENDPOINT_PLACEHOLDER,
    ...staticSession,
  }
}

function buildChatAuthorName(item) {
  const businessName = String(item?.author_business_name || '').trim()
  if (businessName) {
    return businessName
  }

  const fullName = `${String(item?.author_first_name || '').trim()} ${String(item?.author_last_name || '').trim()}`.trim()
  if (fullName) {
    return fullName
  }

  return 'BizSocials Member'
}

function toSessionUiPayload(apiSession) {
  const session = apiSession?.session || {}
  const entries = Array.isArray(apiSession?.entries) ? apiSession.entries : []
  const chatItems = Array.isArray(apiSession?.chat) ? apiSession.chat : []

  const currentEntry =
    entries.find((entry) => entry.status === 'presenting') ||
    (session.current_entry
      ? entries.find((entry) => entry.id === session.current_entry.entry_id)
      : null) ||
    entries[0]

  return {
    id: session.id ? `lp-${session.id}` : 'lp-none',
    sessionId: Number.isFinite(Number(session.id)) ? Number(session.id) : null,
    title: session.title || 'Live Pitch Session',
    watching: Number.isFinite(Number(session.watching_count)) ? Number(session.watching_count) : 0,
    heroImageUrl: session.image_url || session.cover_image_url || '',
    currentPitch: {
      entryId: Number.isFinite(Number(currentEntry?.id))
        ? Number(currentEntry.id)
        : Number.isFinite(Number(session.current_entry?.entry_id))
          ? Number(session.current_entry.entry_id)
          : null,
      name: currentEntry?.display_name || session.current_entry?.name || 'Waiting for the next presenter',
      headline: currentEntry?.headline || session.current_entry?.headline || '',
      summary: currentEntry?.summary || '',
      score: Number.isFinite(Number(currentEntry?.score)) ? Number(currentEntry.score) : 0,
    },
    chat: chatItems.map((item) => ({
      id: String(item.id),
      name: buildChatAuthorName(item),
      text: String(item.message || ''),
    })),
  }
}

export const livePitchesRepository = {
  // API method signatures for gradual switch-over with zero UI redesign.
  listApi(token, { limit = 20, offset = 0 } = {}) {
    return httpClient.get(`${apiEndpoints.livePitches.list}?limit=${limit}&offset=${offset}`, { token })
  },

  getSessionApi(token, livePitchId, { chatLimit = 30 } = {}) {
    return httpClient.get(`${apiEndpoints.livePitches.byId(livePitchId)}?chat_limit=${chatLimit}`, { token })
  },

  listChatApi(token, livePitchId, { limit = 50, beforeMessageId } = {}) {
    const beforeParam = beforeMessageId ? `&before_message_id=${beforeMessageId}` : ''
    return httpClient.get(`${apiEndpoints.livePitches.chat(livePitchId)}?limit=${limit}${beforeParam}`, { token })
  },

  createChatApi(token, livePitchId, payload) {
    return httpClient.post(apiEndpoints.livePitches.chat(livePitchId), payload, { token })
  },

  deleteChatApi(token, livePitchId, messageId) {
    return httpClient.delete(apiEndpoints.livePitches.chatByMessage(livePitchId, messageId), { token })
  },

  voteApi(token, livePitchId, payload) {
    return httpClient.post(apiEndpoints.livePitches.vote(livePitchId), payload, { token })
  },

  fundApi(token, livePitchId, payload) {
    return httpClient.post(apiEndpoints.livePitches.fund(livePitchId), payload, { token })
  },

  touchWatcherApi(token, livePitchId) {
    return httpClient.post(apiEndpoints.livePitches.watcherTouch(livePitchId), undefined, { token })
  },

  leaderboardApi(token, livePitchId, { limit = 20, offset = 0 } = {}) {
    return httpClient.get(`${apiEndpoints.livePitches.leaderboard(livePitchId)}?limit=${limit}&offset=${offset}`, { token })
  },

  async getOverview({ token } = {}) {
    if (ENABLE_LIVE_PITCHES_API && token) {
      try {
        const listResponse = await this.listApi(token, { limit: 20, offset: 0 })

        const firstLiveSession =
          listResponse?.items?.find((session) => String(session?.status || '').toLowerCase() === 'live') ||
          listResponse?.items?.[0]

        let leaderboardItems = []
        if (firstLiveSession?.id) {
          try {
            const leaderboardResponse = await this.leaderboardApi(token, Number(firstLiveSession.id), { limit: 4, offset: 0 })
            leaderboardItems = Array.isArray(leaderboardResponse?.items) ? leaderboardResponse.items : []
          } catch {
            leaderboardItems = []
          }
        }

        return {
          source: 'api',
          endpoint: LIVE_PITCHES_LIST_ENDPOINT_PLACEHOLDER,
          ...toOverviewUiPayload(listResponse, leaderboardItems),
        }
      } catch (error) {
        return presentationDataOrThrow(token, getStaticOverviewPayload, error)
      }
    }

    return presentationDataOrThrow(token, getStaticOverviewPayload, null, 'Live Pitches API is disabled for this account.')
  },

  async getSession({ token, livePitchId = 1 } = {}) {
    if (ENABLE_LIVE_PITCHES_API && token) {
      try {
        const sessionResponse = await this.getSessionApi(token, livePitchId, { chatLimit: 30 })
        const uiPayload = toSessionUiPayload(sessionResponse)

        return {
          source: 'api',
          byIdEndpoint: apiEndpoints.livePitches.byId(':livePitchId'),
          voteEndpoint: LIVE_PITCHES_VOTE_ENDPOINT_PLACEHOLDER,
          fundEndpoint: LIVE_PITCHES_FUND_ENDPOINT_PLACEHOLDER,
          chatEndpoint: LIVE_PITCHES_CHAT_ENDPOINT_PLACEHOLDER,
          ...uiPayload,
        }
      } catch (error) {
        return presentationDataOrThrow(token, getStaticSessionPayload, error)
      }
    }

    return presentationDataOrThrow(token, getStaticSessionPayload, null, 'Live Pitches API is disabled for this account.')
  },
}
