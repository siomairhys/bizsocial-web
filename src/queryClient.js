import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})

export const feedQueryKeys = {
  all: ['feed'],
  list: (tab, topic = '') => ['feed', 'list', tab, topic],
  post: (postId) => ['feed', 'post', Number(postId)],
  comments: (postId) => ['feed', 'comments', Number(postId)],
  topics: ['feed', 'topics'],
  suggestions: ['profiles', 'suggestions'],
  profile: (userId) => ['profiles', Number(userId)],
}

export const pitchReelQueryKeys = {
  all: ['pitch-reels'],
  lists: ['pitch-reels', 'list'],
  list: (tab) => ['pitch-reels', 'list', tab],
  detail: (pitchReelId) => ['pitch-reels', 'detail', String(pitchReelId)],
  interactions: (pitchReelId) => ['pitch-reels', 'interactions', Number(pitchReelId)],
  comments: (pitchReelId) => ['pitch-reels', 'comments', Number(pitchReelId)],
}
