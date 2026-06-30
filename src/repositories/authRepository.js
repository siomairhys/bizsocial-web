import { httpClient } from '../services/httpClient'
import { apiEndpoints } from './apiEndpoints'

function getToken(payload) {
  return (
    payload?.token ||
    payload?.accessToken ||
    payload?.access_token ||
    payload?.data?.token ||
    payload?.data?.accessToken ||
    payload?.data?.access_token ||
    null
  )
}

function getUser(payload) {
  const candidate =
    payload?.user ||
    payload?.account ||
    payload?.profile ||
    payload?.data?.user ||
    payload?.data?.account ||
    payload?.data?.profile ||
    payload?.data ||
    payload ||
    null

  return candidate && typeof candidate === 'object' ? candidate : null
}

function normalizeProfileUser(payload) {
  const source = getUser(payload)
  if (!source) {
    return null
  }

  return {
    id: source.id ?? source.user_id ?? null,
    user_id: source.user_id ?? source.id ?? null,
    first_name: source.first_name ?? source.firstName ?? '',
    last_name: source.last_name ?? source.lastName ?? '',
    firstName: source.firstName ?? source.first_name ?? '',
    lastName: source.lastName ?? source.last_name ?? '',
    business_name: source.business_name ?? source.businessName ?? '',
    businessName: source.businessName ?? source.business_name ?? '',
    email: source.email ?? null,
    avatar_url: source.avatar_url ?? source.avatarUrl ?? source.photoUrl ?? null,
    avatarUrl: source.avatarUrl ?? source.avatar_url ?? source.photoUrl ?? null,
    photoUrl: source.photoUrl ?? source.avatar_url ?? source.avatarUrl ?? null,
    title: source.title ?? null,
    phone: source.phone ?? null,
    industry: source.industry ?? null,
    location: source.location ?? null,
  }
}

function normalizeSession(payload) {
  return {
    token: getToken(payload),
    user: getUser(payload),
    raw: payload,
  }
}

function toSignupPayload(account) {
  return {
    first_name: account.first_name || account.firstName?.trim() || '',
    last_name: account.last_name || account.lastName?.trim() || '',
    business_name: account.business_name || account.businessName?.trim() || '',
    email: account.email?.trim().toLowerCase() || '',
    password: account.password,
  }
}

export const authRepository = {
  async login(credentials) {
    const payload = await httpClient.post(apiEndpoints.auth.login, credentials)
    return normalizeSession(payload)
  },

  async signup(account) {
    const payload = await httpClient.post(apiEndpoints.auth.signup, toSignupPayload(account))
    return normalizeSession(payload)
  },

  async getProfile(token) {
    const payload = await httpClient.get(apiEndpoints.profile.me, { token })
    return normalizeProfileUser(payload)
  },

  async refreshSession(token) {
    const payload = await httpClient.post(apiEndpoints.auth.refresh, undefined, { token })
    return normalizeSession(payload)
  },

  async logout(token) {
    return Promise.resolve({ ok: true, token })
  },
}
