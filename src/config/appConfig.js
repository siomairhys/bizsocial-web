const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '')

const fallbackDomain =
  typeof window !== 'undefined' && window.location?.origin ? window.location.origin : ''

export const appConfig = {
  appDomain: trimTrailingSlash(import.meta.env.VITE_APP_DOMAIN || fallbackDomain),
  apiBaseUrl: trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || '/api/v1'),
}

export function buildApiUrl(endpoint) {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${appConfig.apiBaseUrl}${normalizedEndpoint}`
}
