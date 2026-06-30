import { apiEndpoints } from './apiEndpoints'
import { httpClient } from '../services/httpClient'

function buildFeedPath(tab, limit, offset) {
  return `${apiEndpoints.feed.list}?tab=${encodeURIComponent(tab)}&limit=${limit}&offset=${offset}`
}

export const feedRepository = {
  list(token, { tab = 'for_you', limit = 20, offset = 0 } = {}) {
    return httpClient.get(buildFeedPath(tab, limit, offset), { token })
  },

  listTrendingTopics(token, { limit = 10 } = {}) {
    return httpClient.get(`${apiEndpoints.feed.trendingTopics}?limit=${limit}`, { token })
  },

  createPost(token, payload) {
    return httpClient.post(apiEndpoints.posts.create, payload, { token })
  },

  toggleReaction(token, postId, reactionType = 'like') {
    return httpClient.post(
      apiEndpoints.posts.react(postId),
      { reaction_type: reactionType },
      { token },
    )
  },
}
