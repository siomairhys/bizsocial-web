import { afterEach, describe, expect, it, vi } from 'vitest'

import { feedRepository } from './feedRepository'
import { DEFAULT_ACCOUNT_TOKEN } from '../data/presentationAccount'

afterEach(() => vi.restoreAllMocks())

describe('feedRepository failure behavior', () => {
  it('rejects failed post creation instead of returning a fake post', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ detail: { message: 'Database unavailable' } }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    )))

    await expect(feedRepository.createPost('token', { content: 'Test' })).rejects.toThrow('Database unavailable')
  })

  it('rejects failed reactions instead of inventing a count', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ detail: { message: 'Reaction failed' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )))

    await expect(feedRepository.toggleReaction('token', 4)).rejects.toThrow('Reaction failed')
  })

  it('uses presentation feed data only for the default account', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve(new Response(
      JSON.stringify({ detail: { message: 'API unavailable' } }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    ))))

    const presentationFeed = await feedRepository.list(DEFAULT_ACCOUNT_TOKEN, { tab: 'for_you' })
    expect(presentationFeed.items.length).toBeGreaterThan(0)
    await expect(feedRepository.list('regular-user-token', { tab: 'for_you' })).rejects.toThrow('API unavailable')
  })
})
