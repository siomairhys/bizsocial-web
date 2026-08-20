import { describe, expect, it } from 'vitest'
import { QueryClient } from '@tanstack/react-query'

import { feedQueryKeys } from '../../queryClient'
import { removePostEverywhere, updatePostEverywhere } from './feedCache'

describe('feed cache synchronization', () => {
  it('updates the same post in feed pages and post detail', () => {
    const client = new QueryClient()
    const listKey = feedQueryKeys.list('for_you')
    const postKey = feedQueryKeys.post(7)
    client.setQueryData(listKey, { pages: [{ items: [{ id: 7, reactions_count: 0 }] }], pageParams: [null] })
    client.setQueryData(postKey, { id: 7, reactions_count: 0 })

    updatePostEverywhere(client, 7, (post) => ({ ...post, reactions_count: 1 }))

    expect(client.getQueryData(listKey).pages[0].items[0].reactions_count).toBe(1)
    expect(client.getQueryData(postKey).reactions_count).toBe(1)
  })

  it('removes a deleted post from every cached feed', () => {
    const client = new QueryClient()
    const listKey = feedQueryKeys.list('following')
    client.setQueryData(listKey, { pages: [{ items: [{ id: 3 }, { id: 4 }] }], pageParams: [null] })

    removePostEverywhere(client, 3)

    expect(client.getQueryData(listKey).pages[0].items).toEqual([{ id: 4 }])
  })
})
