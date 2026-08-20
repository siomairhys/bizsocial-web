import { apiEndpoints } from './apiEndpoints'
import { httpClient } from '../services/httpClient'
import { defaultFeedPosts, defaultTrendingTopics } from '../data/defaultSeedData'
import { presentationDataOrThrow } from '../services/presentationData'

function buildFeedPath({ tab, limit, cursor, topic }) {
  const params = new URLSearchParams({ tab, limit: String(limit) })
  if (cursor) params.set('cursor', cursor)
  if (topic) params.set('topic', topic.replace(/^#/, ''))
  return `${apiEndpoints.feed.list}?${params.toString()}`
}

export const feedRepository = {
  async list(token, { tab = 'for_you', limit = 10, cursor = null, topic = null } = {}) {
    try {
      return await httpClient.get(buildFeedPath({ tab, limit, cursor, topic }), { token })
    } catch (error) {
      const normalizedTopic = String(topic || '').replace(/^#/, '').toLowerCase()
      const items = defaultFeedPosts.filter((post) => {
        const matchesTab = tab === 'for_you' || post.tabs?.includes(tab)
        const matchesTopic = !normalizedTopic || String(post.content || '').toLowerCase().includes(`#${normalizedTopic}`)
        return matchesTab && matchesTopic
      }).slice(0, limit)

      return presentationDataOrThrow(token, { tab, limit, items, next_cursor: null }, error)
    }
  },

  async listTrendingTopics(token, { limit = 10 } = {}) {
    try {
      return await httpClient.get(`${apiEndpoints.feed.trendingTopics}?limit=${limit}`, { token })
    } catch (error) {
      return presentationDataOrThrow(token, () => defaultTrendingTopics.slice(0, limit), error)
    }
  },

  createPost(token, payload) {
    return httpClient.post(apiEndpoints.posts.create, payload, { token })
  },

  getPost(token, postId) {
    return httpClient.get(apiEndpoints.posts.byId(postId), { token })
  },

  updatePost(token, postId, payload) {
    return httpClient.patch(apiEndpoints.posts.byId(postId), payload, { token })
  },

  deletePost(token, postId) {
    return httpClient.delete(apiEndpoints.posts.byId(postId), { token })
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

  toggleReaction(token, postId, reactionType = 'like') {
    return httpClient.post(
      apiEndpoints.posts.react(postId),
      { reaction_type: reactionType },
      { token },
    )
  },

  listComments(token, postId, { limit = 50, offset = 0 } = {}) {
    return httpClient.get(
      `${apiEndpoints.posts.comments(postId)}?limit=${limit}&offset=${offset}`,
      { token },
    )
  },

  createComment(token, postId, body, parentCommentId = null) {
    return httpClient.post(
      apiEndpoints.posts.comments(postId),
      { body, parent_comment_id: parentCommentId },
      { token },
    )
  },

  deleteComment(token, postId, commentId) {
    return httpClient.delete(apiEndpoints.posts.commentById(postId, commentId), { token })
  },

  sharePost(token, postId, payload = { share_type: 'repost' }) {
    return httpClient.post(apiEndpoints.posts.shares(postId), payload, { token })
  },
}
