import { apiEndpoints } from './apiEndpoints'
import { httpClient } from '../services/httpClient'
import { presentationDataOrThrow } from '../services/presentationData'

const presentationSuggestions = [
  { user_id: 'presentation-alicia', first_name: 'Alicia', last_name: 'Moore', title: 'Growth Coach', business_name: 'AM Studio' },
  { user_id: 'presentation-tiffany', first_name: 'Tiffany', last_name: 'Grant', title: 'Style Maven', business_name: 'Grant Luxury' },
  { user_id: 'presentation-michael', first_name: 'Michael', last_name: 'Lee', title: 'Investor', business_name: 'Investor Network' },
]

function toUpdatePayload(profile) {
  return {
    first_name: profile.firstName?.trim() || '',
    last_name: profile.lastName?.trim() || '',
    phone: profile.phone?.trim() || null,
    title: profile.title?.trim() || null,
    business_name: profile.businessName?.trim() || '',
    industry: profile.industry?.trim() || null,
    website: profile.website?.trim() || null,
    location: profile.location?.trim() || null,
    bio: profile.bio?.trim() || null,
    avatar_url: profile.photoUrl?.trim() || null,
    cover_url: profile.coverUrl?.trim() || null,
  }
}

function toFormProfile(payload, fallback = {}) {
  if (!payload || typeof payload !== 'object') {
    return { ...fallback }
  }

  return {
    firstName: payload.first_name || fallback.firstName || '',
    lastName: payload.last_name || fallback.lastName || '',
    email: fallback.email || '',
    phone: payload.phone || fallback.phone || '',
    title: payload.title || fallback.title || 'Founder',
    businessName: payload.business_name || fallback.businessName || 'BizSocials Account',
    industry: payload.industry || fallback.industry || 'Professional Services',
    website: payload.website || payload.website_url || fallback.website || '',
    location: payload.location || fallback.location || '',
    bio: payload.bio || fallback.bio || '',
    photoUrl: payload.avatar_url || fallback.photoUrl || '',
    coverUrl: payload.cover_url || fallback.coverUrl || '',
    followerCount: Number(payload.follower_count ?? fallback.followerCount ?? 0),
    followingCount: Number(payload.following_count ?? fallback.followingCount ?? 0),
    role: payload.role || fallback.role || 'user',
    isActive: payload.is_active ?? fallback.isActive ?? true,
    viewerFollowing: Boolean(payload.viewer_following ?? fallback.viewerFollowing ?? false),
    userId: payload.user_id || payload.id || fallback.userId || null,
  }
}

export const profileRepository = {
  async getMyProfile(token, fallback = {}) {
    const payload = await httpClient.get(apiEndpoints.profile.me, { token })
    return toFormProfile(payload, fallback)
  },

  async getPublicProfile(userId, { token, fallback = {} } = {}) {
    const payload = await httpClient.get(apiEndpoints.profile.byUserId(userId), { token })
    return toFormProfile(payload, { ...fallback, userId })
  },

  async getSuggestions(token, { limit = 5 } = {}) {
    try {
      const payload = await httpClient.get(`${apiEndpoints.profile.suggestions}?limit=${limit}`, { token })
      return Array.isArray(payload) ? payload.map((item) => toFormProfile(item)) : []
    } catch (error) {
      return presentationDataOrThrow(token, () => presentationSuggestions.slice(0, limit).map((item) => toFormProfile(item)), error)
    }
  },

  async followUser(token, userId) {
    return httpClient.post(apiEndpoints.profile.follow(userId), undefined, { token })
  },

  async unfollowUser(token, userId) {
    return httpClient.delete(apiEndpoints.profile.follow(userId), { token })
  },

  async updateMyProfile(token, profile, fallback = {}) {
    const payload = await httpClient.put(apiEndpoints.profile.update, toUpdatePayload(profile), {
      token,
    })

    return toFormProfile(payload, { ...fallback, email: profile.email || fallback.email || '' })
  },
}
