import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import PitchReelsPage from './PitchReelsPage'

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  get: vi.fn(),
  interactions: vi.fn(),
  reaction: vi.fn(),
  comments: vi.fn(),
  createComment: vi.fn(),
  deleteComment: vi.fn(),
  share: vi.fn(),
  view: vi.fn(),
  report: vi.fn(),
}))

vi.mock('../modules/auth/context/useAuth', () => ({
  useAuth: () => ({ token: 'token', user: { id: 8 } }),
}))

vi.mock('../repositories/pitchReelsRepository', () => ({
  pitchReelsRepository: {
    list: mocks.list,
    get: mocks.get,
    getInteractions: mocks.interactions,
    toggleReaction: mocks.reaction,
    listComments: mocks.comments,
    createComment: mocks.createComment,
    deleteComment: mocks.deleteComment,
    createShare: mocks.share,
    recordView: mocks.view,
    createReport: mocks.report,
  },
}))

const reel = {
  id: 7,
  authorUserId: 3,
  authorName: 'Alicia Moore',
  initials: 'AM',
  title: 'Growth Reel',
  subtitle: 'A useful business pitch',
  likes: 2,
  comments: 0,
  shares: 0,
  views: 5,
  viewerReacted: false,
  interactionEnabled: true,
  primaryVideoUrl: '',
  coverImageUrl: '',
  gradient: 'from-slate-700 to-slate-900',
}

function summary(overrides = {}) {
  return {
    pitch_reel_id: 7,
    reactions_count: 2,
    comments_count: 0,
    shares_count: 0,
    views_count: 5,
    viewer_reacted: false,
    ...overrides,
  }
}

function renderPage(props = {}) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const onNavigate = props.onNavigate || vi.fn()
  const view = render(
    <QueryClientProvider client={client}>
      <PitchReelsPage onNavigate={onNavigate} reelId={props.reelId} />
    </QueryClientProvider>,
  )
  return { ...view, onNavigate }
}

async function openReel(user) {
  await screen.findByRole('button', { name: /open pitch reel: growth reel/i })
  await user.click(screen.getByRole('button', { name: /open pitch reel: growth reel/i }))
  await screen.findByRole('dialog', { name: 'Growth Reel' })
}

beforeEach(() => {
  mocks.list.mockResolvedValue({ source: 'api', items: [{ ...reel }] })
  mocks.get.mockResolvedValue({ ...reel })
  mocks.interactions.mockResolvedValue(summary())
  mocks.comments.mockResolvedValue([])
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('PitchReelsPage interactions', () => {
  it('synchronizes a successful reaction in the modal and card cache', async () => {
    const user = userEvent.setup()
    mocks.reaction.mockResolvedValue(summary({ reactions_count: 3, viewer_reacted: true }))
    renderPage()
    await openReel(user)

    await user.click(screen.getByRole('button', { name: /like reel, 2 likes/i }))

    await screen.findByRole('button', { name: /unlike reel, 3 likes/i })
    expect(mocks.reaction).toHaveBeenCalledWith('token', 7, 'like')

    await user.keyboard('{Escape}')
    expect(screen.getByLabelText('Reel engagement').textContent).toContain('3')
  })

  it('rolls an optimistic reaction back when the API rejects it', async () => {
    const user = userEvent.setup()
    mocks.reaction.mockRejectedValue(new Error('Database unavailable'))
    renderPage()
    await openReel(user)

    await user.click(screen.getByRole('button', { name: /like reel, 2 likes/i }))

    await screen.findByRole('alert')
    expect(screen.getByRole('button', { name: /like reel, 2 likes/i })).toBeTruthy()
    expect(screen.getByText('Database unavailable')).toBeTruthy()
  })

  it('loads and creates comments while synchronizing the count', async () => {
    const user = userEvent.setup()
    mocks.createComment.mockResolvedValue({
      id: 11,
      pitch_reel_id: 7,
      author_user_id: 8,
      body: 'Strong pitch',
      author_first_name: 'Test',
      author_last_name: 'User',
      author_business_name: 'Test Co',
      viewer_can_delete: true,
    })
    mocks.interactions
      .mockResolvedValueOnce(summary())
      .mockResolvedValue(summary({ comments_count: 1 }))
    renderPage()
    await openReel(user)

    await user.click(screen.getByRole('button', { name: /comments, 0/i }))
    await screen.findByText(/no comments yet/i)
    await user.type(screen.getByLabelText('Write a Reel comment'), 'Strong pitch')
    await user.click(screen.getByRole('button', { name: 'Post Reel comment' }))

    await screen.findByText('Strong pitch')
    await waitFor(() => expect(screen.getByRole('button', { name: /comments, 1/i })).toBeTruthy())
    expect(mocks.createComment).toHaveBeenCalledWith('token', 7, 'Strong pitch')
  })

  it('copies a link, records the share, and updates its count', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    mocks.share.mockResolvedValue({ id: 4, pitch_reel_id: 7, shares_count: 1 })
    renderPage()
    await openReel(user)

    await user.click(screen.getByRole('button', { name: /share reel, 0 shares/i }))
    await user.click(screen.getByRole('button', { name: 'Copy Reel link' }))

    await screen.findByText('Pitch Reels link copied.')
    expect(writeText).toHaveBeenCalledOnce()
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('#/pitch-reels/7'))
    expect(mocks.share).toHaveBeenCalledWith('token', 7, { shareType: 'copy_link' })
    expect(screen.getByRole('button', { name: /share reel, 1 shares/i })).toBeTruthy()
  })

  it('keeps presentation fallback controls explicitly read-only', async () => {
    const user = userEvent.setup()
    mocks.list.mockResolvedValue({
      source: 'static',
      items: [{ ...reel, id: 'reel-1', interactionEnabled: false }],
    })
    renderPage()
    await screen.findByRole('button', { name: /open pitch reel: growth reel/i })
    await user.click(screen.getByRole('button', { name: /open pitch reel: growth reel/i }))

    expect(screen.getByText(/presentation preview is read-only/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /like reel/i }).disabled).toBe(true)
    expect(mocks.interactions).not.toHaveBeenCalled()
  })

  it('loads a directly linked Reel that is not in the active list', async () => {
    mocks.list.mockResolvedValue({ source: 'api', items: [] })
    mocks.get.mockResolvedValue({ ...reel, id: 99, title: 'Direct Linked Reel' })

    renderPage({ reelId: '99' })

    await screen.findByRole('dialog', { name: 'Direct Linked Reel' })
    expect(mocks.get).toHaveBeenCalledWith('token', '99')
  })

  it('keeps next navigation synchronized with the Reel detail route', async () => {
    const user = userEvent.setup()
    const secondReel = { ...reel, id: 8, title: 'Second Reel' }
    mocks.list.mockResolvedValue({ source: 'api', items: [{ ...reel }, secondReel] })
    const { onNavigate } = renderPage()

    await openReel(user)
    expect(onNavigate).toHaveBeenCalledWith('/pitch-reels/7')
    await user.click(screen.getByRole('button', { name: 'View next Reel' }))

    await screen.findByRole('dialog', { name: 'Second Reel' })
    expect(onNavigate).toHaveBeenLastCalledWith('/pitch-reels/8')
    expect(screen.getByText('2 of 2')).toBeTruthy()
  })

  it('submits a Reel report through the backend menu action', async () => {
    const user = userEvent.setup()
    mocks.report.mockResolvedValue({ id: 4, pitch_reel_id: 7, status: 'pending' })
    renderPage()
    await openReel(user)

    await user.click(screen.getByRole('button', { name: 'More Reel actions' }))
    await user.click(screen.getByRole('menuitem', { name: 'Report Reel' }))
    await user.selectOptions(screen.getByLabelText('Reason'), 'misleading')
    await user.type(screen.getByLabelText('Details (optional)'), 'The claims need review.')
    await user.click(screen.getByRole('button', { name: 'Submit report' }))

    await screen.findByText('Report submitted for review.')
    expect(mocks.report).toHaveBeenCalledWith('token', 7, {
      reason: 'misleading',
      details: 'The claims need review.',
    })
  })
})
