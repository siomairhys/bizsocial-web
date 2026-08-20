import { feedQueryKeys } from '../../queryClient'

function updateFeedData(data, postId, updater) {
  if (!data) return data
  if (Array.isArray(data.pages)) {
    return {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        items: (page.items || []).map((post) =>
          Number(post.id) === Number(postId) ? updater(post) : post,
        ),
      })),
    }
  }
  if (Number(data.id) === Number(postId)) return updater(data)
  return data
}

export function updatePostEverywhere(queryClient, postId, updater) {
  queryClient.setQueriesData({ queryKey: feedQueryKeys.all }, (data) =>
    updateFeedData(data, postId, updater),
  )
}

export function removePostEverywhere(queryClient, postId) {
  queryClient.setQueriesData({ queryKey: feedQueryKeys.all }, (data) => {
    if (!data) return data
    if (Array.isArray(data.pages)) {
      return {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          items: (page.items || []).filter((post) => Number(post.id) !== Number(postId)),
        })),
      }
    }
    return Number(data.id) === Number(postId) ? undefined : data
  })
}
