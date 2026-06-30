import { apiEndpoints } from './apiEndpoints'
import { httpClient } from '../services/httpClient'

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
  }
}

export const profileRepository = {
  async getMyProfile(token, fallback = {}) {
    const payload = await httpClient.get(apiEndpoints.profile.me, { token })
    return toFormProfile(payload, fallback)
  },

  async updateMyProfile(token, profile, fallback = {}) {
    const payload = await httpClient.put(apiEndpoints.profile.update, toUpdatePayload(profile), {
      token,
    })

    return toFormProfile(payload, { ...fallback, email: profile.email || fallback.email || '' })
  },
}
