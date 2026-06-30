import { buildApiUrl } from '../config/appConfig'

export class HttpError extends Error {
  constructor(message, { status, data } = {}) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.data = data
  }
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

function getErrorMessage(response, data) {
  if (data && typeof data === 'object') {
    const detail = data.detail
    if (detail && typeof detail === 'object') {
      return detail.message || detail.error || `Request failed with status ${response.status}`
    }

    return (
      data.message ||
      data.error ||
      data.detail ||
      `Request failed with status ${response.status}`
    )
  }

  if (typeof data === 'string' && data.trim()) {
    return data
  }

  return `Request failed with status ${response.status}`
}

async function request(endpoint, options = {}) {
  const { method = 'GET', body, token, headers = {}, signal } = options
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const requestHeaders = {
    Accept: 'application/json',
    ...(!isFormData && body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  }

  const response = await fetch(buildApiUrl(endpoint), {
    method,
    headers: requestHeaders,
    body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    credentials: 'same-origin',
    signal,
  })
  const data = await parseResponse(response)

  if (!response.ok) {
    throw new HttpError(getErrorMessage(response, data), {
      status: response.status,
      data,
    })
  }

  return data
}

export const httpClient = {
  request,
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
}
