const trimTrailingSlash = (value) => String(value || '').replace(/\/+$/, '')

function getRequiredEnv(name) {
  const value = import.meta.env[name]
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required frontend env: ${name}`)
  }

  return String(value).trim()
}

export const appConfig = {
  appDomain: trimTrailingSlash(getRequiredEnv('VITE_APP_DOMAIN')),
  apiBaseUrl: trimTrailingSlash(getRequiredEnv('VITE_API_BASE_URL')),
}

export function buildApiUrl(endpoint) {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${appConfig.apiBaseUrl}${normalizedEndpoint}`
}
