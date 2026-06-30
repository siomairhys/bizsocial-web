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
  return (
    payload?.user ||
    payload?.account ||
    payload?.profile ||
    payload?.data?.user ||
    payload?.data?.account ||
    payload?.data?.profile ||
    payload?.data ||
    null
  )
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
    const payload = await httpClient.get(apiEndpoints.users.me, { token })
    return getUser(payload)
  },

  async logout(token) {
    return Promise.resolve({ ok: true, token })
  },
}
