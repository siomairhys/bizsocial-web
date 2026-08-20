import { afterEach, describe, expect, it, vi } from 'vitest'

import { DEFAULT_ACCOUNT_TOKEN } from '../data/presentationAccount'
import { pitchReelsRepository } from './pitchReelsRepository'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('pitchReelsRepository interactions', () => {
  it('maps authoritative interaction state from the API list', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({
      items: [{
        id: 7,
        author_user_id: 3,
        author_first_name: 'Alicia',
        author_last_name: 'Moore',
        title: 'Growth Reel',
        reactions_count: 4,
        comments_count: 2,
        shares_count: 1,
        views_count: 8,
        viewer_reacted: true,
      }],
    })))

    const payload = await pitchReelsRepository.list('token', { tab: 'top' })

    expect(payload.items[0]).toMatchObject({
      id: 7,
      authorUserId: 3,
      likes: 4,
      comments: 2,
      shares: 1,
      views: 8,
      viewerReacted: true,
      interactionEnabled: true,
    })
  })

  it('sends reaction and comment writes to their Reel endpoints', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ pitch_reel_id: 7, viewer_reacted: true }))
      .mockResolvedValueOnce(jsonResponse({ id: 11, pitch_reel_id: 7, body: 'Useful pitch' }))
    vi.stubGlobal('fetch', fetchMock)

    await pitchReelsRepository.toggleReaction('token', 7, 'love')
    await pitchReelsRepository.createComment('token', 7, '  Useful pitch  ')

    expect(fetchMock.mock.calls[0][0]).toContain('/pitch-reels/7/reactions')
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ reaction_type: 'love' })
    expect(fetchMock.mock.calls[1][0]).toContain('/pitch-reels/7/comments')
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      body: 'Useful pitch',
      parent_comment_id: null,
    })
  })

  it('rejects failed interactions instead of inventing success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(
      { detail: { message: 'Reaction could not be saved' } },
      500,
    )))

    await expect(pitchReelsRepository.toggleReaction('token', 7)).rejects.toThrow(
      'Reaction could not be saved',
    )
  })

  it('records shares and qualified views with the backend contract', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ id: 4, pitch_reel_id: 7, shares_count: 2 }))
      .mockResolvedValueOnce(jsonResponse({ pitch_reel_id: 7, recorded: true, views_count: 9 }))
    vi.stubGlobal('fetch', fetchMock)

    await pitchReelsRepository.createShare('token', 7, { shareType: 'copy_link' })
    await pitchReelsRepository.recordView('token', 7, {
      watchDurationSeconds: 3.25,
      completed: false,
    })

    expect(fetchMock.mock.calls[0][0]).toContain('/pitch-reels/7/shares')
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      share_type: 'copy_link',
      share_text: null,
    })
    expect(fetchMock.mock.calls[1][0]).toContain('/pitch-reels/7/views')
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      watch_duration_seconds: 3.25,
      completed: false,
    })
  })

  it('marks presentation fallback Reels as read-only', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(
      { detail: { message: 'API unavailable' } },
      503,
    )))

    const payload = await pitchReelsRepository.list(DEFAULT_ACCOUNT_TOKEN, { tab: 'top' })

    expect(payload.source).toBe('static')
    expect(payload.items.length).toBeGreaterThan(0)
    expect(payload.items.every((item) => item.interactionEnabled === false)).toBe(true)
  })

  it('loads a shareable Reel detail and maps its navigation metadata', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      id: 7,
      author_user_id: 3,
      author_first_name: 'Alicia',
      author_last_name: 'Moore',
      author_avatar_url: 'https://example.test/avatar.jpg',
      title: 'Growth Reel',
      caption: 'A useful pitch',
      visibility: 'followers',
      is_bizquest: true,
      tags: ['Growth'],
      reactions_count: 2,
    }))
    vi.stubGlobal('fetch', fetchMock)

    const payload = await pitchReelsRepository.get('token', 7)

    expect(fetchMock.mock.calls[0][0]).toContain('/pitch-reels/7')
    expect(payload).toMatchObject({
      id: 7,
      authorUserId: 3,
      authorAvatarUrl: 'https://example.test/avatar.jpg',
      visibility: 'followers',
      isBizQuest: true,
      tags: ['Growth'],
      interactionEnabled: true,
    })
  })

  it('submits reports to the authoritative Reel endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      id: 4,
      pitch_reel_id: 7,
      status: 'pending',
    }))
    vi.stubGlobal('fetch', fetchMock)

    await pitchReelsRepository.createReport('token', 7, {
      reason: 'misleading',
      details: 'Claims need review.',
    })

    expect(fetchMock.mock.calls[0][0]).toContain('/pitch-reels/7/reports')
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      reason: 'misleading',
      details: 'Claims need review.',
    })
  })
})
