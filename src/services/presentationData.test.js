import { describe, expect, it } from 'vitest'

import { DEFAULT_ACCOUNT_TOKEN } from '../data/presentationAccount'
import { isPresentationAccount, presentationDataOrThrow } from './presentationData'

describe('presentation data isolation', () => {
  it('recognizes only the dedicated default-account token', () => {
    expect(isPresentationAccount(DEFAULT_ACCOUNT_TOKEN)).toBe(true)
    expect(isPresentationAccount('regular-user-token')).toBe(false)
    expect(isPresentationAccount(null)).toBe(false)
  })

  it('does not return presentation data to regular accounts', () => {
    expect(() => presentationDataOrThrow('regular-user-token', { demo: true }, new Error('API failed'))).toThrow('API failed')
    expect(presentationDataOrThrow(DEFAULT_ACCOUNT_TOKEN, { demo: true }, new Error('API failed'))).toEqual({ demo: true })
  })
})
