import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createPost: vi.fn(),
  deleteMyDraft: vi.fn(),
  getMyDraft: vi.fn(),
  saveMyDraft: vi.fn(),
  upload: vi.fn(),
}))

vi.mock('../modules/auth/context/useAuth', () => ({
  useAuth: () => ({ token: 'token', user: { firstName: 'Test', lastName: 'Founder', businessName: 'Test Co' } }),
}))
vi.mock('../modules/media/hooks/useMediaUpload', () => ({
  useMediaUpload: () => ({ isUploading: false, progress: 0, error: '', upload: mocks.upload }),
}))
vi.mock('../repositories/feedRepository', () => ({
  feedRepository: {
    createPost: mocks.createPost,
    deleteMyDraft: mocks.deleteMyDraft,
    getMyDraft: mocks.getMyDraft,
    saveMyDraft: mocks.saveMyDraft,
  },
}))
vi.mock('../repositories/mediaRepository', () => ({ mediaRepository: { remove: vi.fn() } }))

import CreatePostPage from './CreatePostPage'

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('CreatePostPage', () => {
  it('publishes a media-only BizQuest post through the single composer', async () => {
    mocks.getMyDraft.mockResolvedValue(null)
    mocks.createPost.mockResolvedValue({ id: 44 })
    mocks.deleteMyDraft.mockResolvedValue({ success: true })
    mocks.upload.mockResolvedValue({ mediaId: 42, mediaType: 'image', downloadUrl: 'https://example.test/photo.jpg' })
    const onNavigate = vi.fn()
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    const user = userEvent.setup()
    const { container } = render(<QueryClientProvider client={client}><CreatePostPage onNavigate={onNavigate} /></QueryClientProvider>)

    await waitFor(() => expect(mocks.getMyDraft).toHaveBeenCalled())
    const file = new File(['image'], 'photo.png', { type: 'image/png' })
    await user.upload(container.querySelector('input[type="file"]'), file)
    await waitFor(() => expect(mocks.upload).toHaveBeenCalledWith(file))
    await user.click(screen.getByRole('checkbox', { name: /Include in BizQuest/i }))
    await user.click(screen.getByRole('button', { name: 'Publish Post' }))

    await waitFor(() => expect(mocks.createPost).toHaveBeenCalledWith('token', expect.objectContaining({
      content: null,
      is_bizquest: true,
      media_ids: [42],
      visibility: 'public',
    })))
    expect(onNavigate).toHaveBeenCalledWith('/feed')
  })
})
