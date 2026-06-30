import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { authRepository } from '../../../repositories/authRepository'
import { authStorage } from '../../../services/authStorage'
import { AuthContext } from './AuthContextValue'

const ACTIVITY_WRITE_THROTTLE_MS = 15 * 1000

function envMinutesToMs(name) {
  const value = import.meta.env[name]
  if (!value || !String(value).trim()) {
    throw new Error(`Missing required frontend env: ${name}`)
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Frontend env must be a positive number of minutes: ${name}`)
  }

  return parsed * 60 * 1000
}

const SESSION_REFRESH_WINDOW_MS = envMinutesToMs('VITE_SESSION_REFRESH_WINDOW_MINUTES')
const IDLE_TIMEOUT_MS = envMinutesToMs('VITE_SESSION_IDLE_TIMEOUT_MINUTES')
const SESSION_HEARTBEAT_MS = envMinutesToMs('VITE_SESSION_HEARTBEAT_MINUTES')

function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') {
    return null
  }

  const segments = token.split('.')
  if (segments.length < 2) {
    return null
  }

  try {
    const base64 = segments[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`
    const decoded = atob(padded)
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

function getTokenExpiresAt(token) {
  const payload = decodeJwtPayload(token)
  const exp = payload?.exp
  if (!exp || !Number.isFinite(Number(exp))) {
    return null
  }
  return Number(exp) * 1000
}

function normalizeStoredSession(storedSession) {
  if (!storedSession || typeof storedSession !== 'object') {
    return null
  }

  const token = storedSession.token || null
  const expiresAt = storedSession.expiresAt || getTokenExpiresAt(token)
  const now = Date.now()

  return {
    token,
    user: storedSession.user || null,
    expiresAt: expiresAt || null,
    lastActivityAt: storedSession.lastActivityAt || now,
  }
}

function fallbackUserFrom(values) {
  const email = values.email?.trim()
  const firstName = values.firstName?.trim() || values.first_name?.trim() || ''
  const lastName = values.lastName?.trim() || values.last_name?.trim() || ''
  const name = [firstName, lastName].filter(Boolean).join(' ')
  const businessName = values.businessName?.trim() || values.business_name?.trim()

  return {
    name: values.name?.trim() || name || email || 'BizSocials Member',
    firstName,
    lastName,
    businessName: businessName || 'BizSocials Account',
    email,
  }
}

function createSession(authResult, fallbackUser) {
  const token = authResult?.token || null
  const now = Date.now()

  return {
    token,
    user: authResult?.user || fallbackUser,
    expiresAt: getTokenExpiresAt(token),
    lastActivityAt: now,
  }
}

function hasProfileIdentity(user) {
  if (!user || typeof user !== 'object') {
    return false
  }

  const hasName = Boolean(
    user.firstName || user.lastName || user.first_name || user.last_name || user.name,
  )
  const hasBusiness = Boolean(user.businessName || user.business_name)
  return hasName || hasBusiness
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => normalizeStoredSession(authStorage.getSession()))
  const refreshInFlightRef = useRef(false)
  const lastActivityWriteRef = useRef(0)

  const persistSession = useCallback((nextSession) => {
    const normalized = normalizeStoredSession(nextSession)
    if (!normalized) {
      authStorage.clearSession()
      setSession(null)
      return null
    }

    authStorage.setSession(normalized)
    setSession(normalized)
    return normalized
  }, [])

  const signIn = useCallback(
    async (credentials) => {
      const authResult = await authRepository.login(credentials)

      let hydratedUser = authResult?.user || null
      if (authResult?.token) {
        try {
          hydratedUser = await authRepository.getProfile(authResult.token)
        } catch {
          hydratedUser = authResult?.user || null
        }
      }

      return persistSession(
        createSession({ ...authResult, user: hydratedUser }, fallbackUserFrom(credentials)),
      )
    },
    [persistSession],
  )

  const signUp = useCallback(
    async (account) => {
      const authResult = await authRepository.signup(account)

      let hydratedUser = authResult?.user || null
      if (authResult?.token) {
        try {
          hydratedUser = await authRepository.getProfile(authResult.token)
        } catch {
          hydratedUser = authResult?.user || null
        }
      }

      return persistSession(
        createSession({ ...authResult, user: hydratedUser }, fallbackUserFrom(account)),
      )
    },
    [persistSession],
  )

  const signOut = useCallback(() => {
    const token = session?.token
    authStorage.clearSession()
    setSession(null)

    if (token) {
      authRepository.logout(token).catch(() => {})
    }
  }, [session?.token])

  const markUserActivity = useCallback(() => {
    if (!session?.token) {
      return
    }

    const now = Date.now()
    if (now - lastActivityWriteRef.current < ACTIVITY_WRITE_THROTTLE_MS) {
      return
    }

    lastActivityWriteRef.current = now
    setSession((previous) => {
      if (!previous) {
        return previous
      }

      const updated = {
        ...previous,
        lastActivityAt: now,
      }

      authStorage.setSession(updated)
      return updated
    })
  }, [session?.token])

  useEffect(() => {
    let active = true

    async function hydrateStoredSession() {
      if (!session?.token || hasProfileIdentity(session?.user)) {
        return
      }

      try {
        const profile = await authRepository.getProfile(session.token)
        if (!active || !profile) {
          return
        }

        persistSession({
          token: session.token,
          user: profile,
        })
      } catch {
        // Keep current fallback user if profile fetch fails.
      }
    }

    hydrateStoredSession()

    return () => {
      active = false
    }
  }, [persistSession, session?.token, session?.user])

  useEffect(() => {
    if (!session?.token) {
      return undefined
    }

    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll']
    const onActivity = () => {
      markUserActivity()
    }

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, onActivity, { passive: true })
    })

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, onActivity)
      })
    }
  }, [markUserActivity, session?.token])

  useEffect(() => {
    if (!session?.token) {
      return undefined
    }

    const heartbeat = window.setInterval(async () => {
      const now = Date.now()
      const expiresAt = session.expiresAt || getTokenExpiresAt(session.token)

      if (!expiresAt || now >= expiresAt) {
        signOut()
        return
      }

      const idleForMs = now - (session.lastActivityAt || now)
      const isActiveRecently = idleForMs < IDLE_TIMEOUT_MS
      const isInRefreshWindow = expiresAt - now <= SESSION_REFRESH_WINDOW_MS

      if (!isActiveRecently || !isInRefreshWindow || refreshInFlightRef.current) {
        return
      }

      refreshInFlightRef.current = true

      try {
        const refreshed = await authRepository.refreshSession(session.token)
        const refreshedToken = refreshed?.token
        if (!refreshedToken) {
          signOut()
          return
        }

        const refreshedExpiresAt = getTokenExpiresAt(refreshedToken)
        persistSession({
          token: refreshedToken,
          user: refreshed?.user || session.user,
          expiresAt: refreshedExpiresAt,
          lastActivityAt: Date.now(),
        })
      } catch {
        signOut()
      } finally {
        refreshInFlightRef.current = false
      }
    }, SESSION_HEARTBEAT_MS)

    return () => {
      window.clearInterval(heartbeat)
    }
  }, [persistSession, session, signOut])

  const value = useMemo(
    () => ({
      session,
      token: session?.token || null,
      user: session?.user || null,
      sessionExpiresAt: session?.expiresAt || null,
      isAuthenticated: Boolean(session?.token || session?.user),
      signIn,
      signUp,
      signOut,
    }),
    [session, signIn, signOut, signUp],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
