import { DEFAULT_ACCOUNT_TOKEN } from '../data/presentationAccount'

export function isPresentationAccount(token) {
  return Boolean(token) && token === DEFAULT_ACCOUNT_TOKEN
}

export function presentationDataOrThrow(token, presentationData, error, message = 'Live data could not be loaded.') {
  if (isPresentationAccount(token)) {
    return typeof presentationData === 'function' ? presentationData() : presentationData
  }

  if (error instanceof Error) {
    throw error
  }

  throw new Error(message)
}

export function requirePresentationAccount(token, message = 'This presentation data is only available in the default account.') {
  if (!isPresentationAccount(token)) {
    throw new Error(message)
  }
}
