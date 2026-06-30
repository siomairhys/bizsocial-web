const SESSION_STORAGE_KEY = 'bizsocials.auth.session'

function getStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

export const authStorage = {
  getSession() {
    const storage = getStorage()
    if (!storage) {
      return null
    }

    const rawSession = storage.getItem(SESSION_STORAGE_KEY)
    if (!rawSession) {
      return null
    }

    try {
      return JSON.parse(rawSession)
    } catch {
      storage.removeItem(SESSION_STORAGE_KEY)
      return null
    }
  },

  setSession(session) {
    const storage = getStorage()
    if (!storage) {
      return
    }

    storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  },

  clearSession() {
    const storage = getStorage()
    if (!storage) {
      return
    }

    storage.removeItem(SESSION_STORAGE_KEY)
  },
}
