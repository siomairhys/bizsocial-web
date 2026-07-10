import { apiEndpoints } from './apiEndpoints'
import { httpClient } from '../services/httpClient'
import { defaultAccount, defaultFeedPosts, defaultTrendingTopics } from '../data/defaultSeedData'

function buildFeedPath(tab, limit, offset) {
  return `${apiEndpoints.feed.list}?tab=${encodeURIComponent(tab)}&limit=${limit}&offset=${offset}`
}

function getStaticPosts(tab, limit, offset) {
  const filtered =
    tab === 'for_you'
      ? defaultFeedPosts
      : defaultFeedPosts.filter((post) => Array.isArray(post.tabs) && post.tabs.includes(tab))

  return {
    source: 'static',
    items: filtered.slice(offset, offset + limit),
    total: filtered.length,
  }
}

export const feedRepository = {
  async list(token, { tab = 'for_you', limit = 20, offset = 0 } = {}) {
    if (!token) {
      return getStaticPosts(tab, limit, offset)
    }

    try {
      return await httpClient.get(buildFeedPath(tab, limit, offset), { token })
    } catch {
      return getStaticPosts(tab, limit, offset)
    }
  },

  async listTrendingTopics(token, { limit = 10 } = {}) {
    if (!token) {
      return defaultTrendingTopics.slice(0, limit)
    }

    try {
      return await httpClient.get(`${apiEndpoints.feed.trendingTopics}?limit=${limit}`, { token })
    } catch {
      return defaultTrendingTopics.slice(0, limit)
    }
  },

  async createPost(token, payload) {
    try {
      return await httpClient.post(apiEndpoints.posts.create, payload, { token })
    } catch {
      return {
        id: `local-post-${Date.now()}`,
        author_first_name: defaultAccount.first_name,
        author_last_name: defaultAccount.last_name,
        author_title: defaultAccount.title,
        author_business_name: defaultAccount.business_name,
        author_avatar_url: defaultAccount.avatar_url,
        created_at: new Date().toISOString(),
        content: payload?.content || '',
        media: [],
        reactions_count: 0,
        comments_count: 0,
        shares_count: 0,
        viewer_reacted: false,
        media_count: 0,
      }
    }
  },

  getMyDraft(token) {
    return httpClient.get(apiEndpoints.posts.draftMe, { token })
  },

  saveMyDraft(token, payload) {
    return httpClient.put(apiEndpoints.posts.draftMe, payload, { token })
  },

  deleteMyDraft(token) {
    return httpClient.delete(apiEndpoints.posts.draftMe, { token })
  },

  async toggleReaction(token, postId, reactionType = 'like') {
    try {
      return await httpClient.post(
        apiEndpoints.posts.react(postId),
        { reaction_type: reactionType },
        { token },
      )
    } catch {
      return {
        reactions_count: 1,
        comments_count: 0,
        shares_count: 0,
        viewer_reacted: reactionType === 'like',
      }
    }
  },
}
