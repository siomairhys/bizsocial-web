import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import PostCard from './PostCard'

afterEach(cleanup)

const post = {
  id: 12,
  author_user_id: 5,
  author_first_name: 'Alicia',
  author_last_name: 'Moore',
  author_business_name: 'Growth Studio',
  author_title: 'Coach',
  content: 'A synchronized feed post',
  visibility: 'public',
  created_at: new Date().toISOString(),
  reactions_count: 2,
  comments_count: 3,
  shares_count: 1,
  media: [],
}

function renderCard(overrides = {}) {
  const callbacks = {
    onProfile: vi.fn(), onView: vi.fn(), onReact: vi.fn(), onComments: vi.fn(),
    onShare: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn(), onCopyLink: vi.fn(), onOpenMedia: vi.fn(),
    ...overrides,
  }
  render(<PostCard post={post} currentUserId={5} {...callbacks} />)
  return callbacks
}

describe('PostCard interactions', () => {
  it('wires reaction, comments, and share actions', async () => {
    const user = userEvent.setup()
    const callbacks = renderCard()

    await user.click(screen.getByRole('button', { name: '2' }))
    await user.click(screen.getByRole('button', { name: '3' }))
    await user.click(screen.getByRole('button', { name: '1' }))

    expect(callbacks.onReact).toHaveBeenCalledWith(12)
    expect(callbacks.onComments).toHaveBeenCalledWith(post)
    expect(callbacks.onShare).toHaveBeenCalledWith(post)
  })

  it('exposes owner edit and delete actions in the post menu', async () => {
    const user = userEvent.setup()
    const callbacks = renderCard()

    await user.click(screen.getByLabelText('Open post menu'))
    await user.click(screen.getByRole('button', { name: 'Edit post' }))
    await user.click(screen.getByRole('button', { name: 'Delete post' }))

    expect(callbacks.onEdit).toHaveBeenCalledWith(post)
    expect(callbacks.onDelete).toHaveBeenCalledWith(12)
  })
})
