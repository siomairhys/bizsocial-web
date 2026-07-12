/**
 * Groups Repository
 * Handles API calls for the Groups module with local fallback data.
 */

import { httpClient } from '../services/httpClient'
import { apiEndpoints } from './apiEndpoints'

export const fallbackGroupsData = {
  items: [
    {
      id: 1,
      name: 'Entrepreneurs Unite',
      slug: 'entrepreneurs-unite',
      description: 'A community for founders documenting the journey from idea to scale.',
      privacy: 'public',
      member_count: 3,
      posts_count: 3,
      cover_media_id: null,
      created_at: '2024-01-15T10:00:00Z',
      topics: ['Business Growth', 'Funding', 'Marketing'],
      welcome_prompt: 'Share your current business goal and one decision you are working through.'
    },
    {
      id: 2,
      name: 'Women in Tech',
      slug: 'women-in-tech',
      description: 'Supporting and amplifying women founders in technology.',
      privacy: 'public',
      member_count: 2,
      posts_count: 1,
      cover_media_id: null,
      created_at: '2024-01-18T14:30:00Z',
      topics: ['Leadership', 'Tech'],
      welcome_prompt: 'Introduce your company, product stage, and the support you need next.'
    },
    {
      id: 3,
      name: 'Bootstrappers Club',
      slug: 'bootstrappers-club',
      description: 'For founders building profitable businesses without external funding.',
      privacy: 'public',
      member_count: 1,
      posts_count: 0,
      cover_media_id: null,
      created_at: '2024-02-01T09:15:00Z',
      topics: ['Profitability', 'Operations'],
      welcome_prompt: 'Share the revenue milestone you are focused on this month.'
    }
  ],
  limit: 20,
  offset: 0,
  total: 3
}

const fallbackPostsByGroup = {
  1: [
    {
      id: 1,
      group_id: 1,
      user_id: 2,
      first_name: 'Alicia',
      last_name: 'Moore',
      avatar_url: null,
      body: 'What is the one thing you did this week that moved your business forward? Drop it below so we can celebrate it together.',
      reactions_count: 124,
      comments_count: 58,
      created_at: '2024-02-20T08:00:00Z'
    },
    {
      id: 2,
      group_id: 1,
      user_id: 3,
      first_name: 'David',
      last_name: 'Chen',
      avatar_url: null,
      body: 'I am rebuilding our onboarding flow and would appreciate feedback on which value point should lead the pitch.',
      reactions_count: 82,
      comments_count: 31,
      created_at: '2024-02-19T16:30:00Z'
    }
  ],
  2: [
    {
      id: 4,
      group_id: 2,
      user_id: 2,
      first_name: 'Tanya',
      last_name: 'Grant',
      avatar_url: null,
      body: 'We are preparing for a new pilot. Has anyone tested founder-led onboarding with enterprise buyers?',
      reactions_count: 46,
      comments_count: 12,
      created_at: '2024-02-18T11:45:00Z'
    }
  ],
  3: []
}

const fallbackEvents = {
  items: [
    { id: 1, title: 'Founder Feedback Friday', starts_at: '2024-03-08T18:00:00Z', location: 'Virtual' },
    { id: 2, title: 'Funding Readiness AMA', starts_at: '2024-03-14T18:00:00Z', location: 'Virtual' }
  ],
  limit: 20,
  offset: 0,
  total: 2
}

function isNumericIdentifier(value) {
  return Number.isInteger(value) || (typeof value === 'string' && /^\d+$/.test(value))
}

function getFallbackGroup(identifier) {
  const normalizedIdentifier = String(identifier || '').toLowerCase()
  const group = fallbackGroupsData.items.find((item) => (
    String(item.id) === normalizedIdentifier || item.slug === normalizedIdentifier
  ))

  return group || fallbackGroupsData.items[0]
}

function getFallbackPosts(identifier, limit = 20, offset = 0) {
  const group = getFallbackGroup(identifier)
  const posts = fallbackPostsByGroup[group.id] || []

  return {
    items: posts.slice(offset, offset + limit),
    limit,
    offset,
    total: posts.length
  }
}

class GroupsRepository {
  async getList({ token, limit = 20, offset = 0 } = {}) {
    try {
      return await httpClient.get(`${apiEndpoints.groups.list}?limit=${limit}&offset=${offset}`, { token })
    } catch (error) {
      console.error('Failed to fetch groups list:', error)
      return { ...fallbackGroupsData, limit, offset }
    }
  }

  async getDetail(identifier, { token } = {}) {
    try {
      const endpoint = isNumericIdentifier(identifier)
        ? apiEndpoints.groups.byId(identifier)
        : apiEndpoints.groups.bySlug(identifier)

      return await httpClient.get(endpoint, { token })
    } catch (error) {
      console.error(`Failed to fetch group ${identifier}:`, error)
      return getFallbackGroup(identifier)
    }
  }

  async create(token, groupData) {
    return httpClient.post(apiEndpoints.groups.create, groupData, { token })
  }

  async join(token, groupId) {
    return httpClient.post(apiEndpoints.groups.join(groupId), undefined, { token })
  }

  async getPostList(groupId, { token, limit = 20, offset = 0 } = {}) {
    try {
      return await httpClient.get(`${apiEndpoints.groups.posts(groupId)}?limit=${limit}&offset=${offset}`, { token })
    } catch (error) {
      console.error(`Failed to fetch posts for group ${groupId}:`, error)
      return getFallbackPosts(groupId, limit, offset)
    }
  }

  async createPost(token, groupId, postData) {
    return httpClient.post(apiEndpoints.groups.posts(groupId), postData, { token })
  }

  async getEventList(groupId, { token, limit = 20, offset = 0 } = {}) {
    try {
      return await httpClient.get(`${apiEndpoints.groups.events(groupId)}?limit=${limit}&offset=${offset}`, { token })
    } catch (error) {
      console.error(`Failed to fetch events for group ${groupId}:`, error)
      return { ...fallbackEvents, limit, offset }
    }
  }
}

export const groupsRepository = new GroupsRepository()
export default groupsRepository
