import { apiEndpoints } from './apiEndpoints'
import { httpClient } from '../services/httpClient'

export const mediaRepository = {
  reserve(token, payload) {
    return httpClient.post(apiEndpoints.media.reserve, payload, { token })
  },

  markReady(token, mediaId, payload) {
    return httpClient.post(apiEndpoints.media.ready(mediaId), payload, { token })
  },

  attach(token, mediaId, payload) {
    return httpClient.post(apiEndpoints.media.attach(mediaId), payload, { token })
  },

  listMine(token, params = {}) {
    const limit = Number.isFinite(params.limit) ? params.limit : 20
    const offset = Number.isFinite(params.offset) ? params.offset : 0
    return httpClient.get(`${apiEndpoints.media.mine}?limit=${limit}&offset=${offset}`, { token })
  },

  listByParent(token, parentType, parentId) {
    return httpClient.get(apiEndpoints.media.byParent(parentType, parentId), { token })
  },

  remove(token, mediaId) {
    return httpClient.delete(apiEndpoints.media.remove(mediaId), { token })
  },
}
