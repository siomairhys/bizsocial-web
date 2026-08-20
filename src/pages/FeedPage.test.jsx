import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  topics: vi.fn(),
  suggestions: vi.fn(),
  groups: vi.fn(),
}))

vi.mock('../modules/auth/context/useAuth', () => ({
  useAuth: () => ({ token: 'token', user: { id: 8, firstName: 'Test', lastName: 'User' } }),
}))

vi.mock('../repositories/feedRepository', () => ({
  feedRepository: {
    list: mocks.list,
    listTrendingTopics: mocks.topics,
    toggleReaction: vi.fn(),
    deletePost: vi.fn(),
  },
}))

vi.mock('../repositories/profileRepository', () => ({
  profileRepository: { getSuggestions: mocks.suggestions, followUser: vi.fn() },
}))

vi.mock('../repositories/groupsRepository', () => ({
  groupsRepository: { getList: mocks.groups, join: vi.fn() },
}))

vi.mock('./CreatePostPage', () => ({
  default: () => <h2 id="feed-composer-title">Create post form</h2>,
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('Feed inline composer', () => {
  it('opens the composer without navigating away from the feed', async () => {
    mocks.list.mockResolvedValue({ items: [], next_cursor: null })
    mocks.topics.mockResolvedValue([])
    mocks.suggestions.mockResolvedValue([])
    mocks.groups.mockResolvedValue({ items: [] })
    const onNavigate = vi.fn()
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(<QueryClientProvider client={client}><FeedPage onNavigate={onNavigate} /></QueryClientProvider>)
    await waitFor(() => expect(mocks.list).toHaveBeenCalled())

    await userEvent.click(screen.getByRole('button', { name: /share an update/i }))

    expect(screen.getByRole('dialog', { name: /create post form/i })).toBeTruthy()
    expect(onNavigate).not.toHaveBeenCalledWith('/create-post')
  })
})

import FeedPage from './FeedPage'
