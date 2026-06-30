import { useCallback, useMemo, useState } from 'react'
import { authRepository } from '../../../repositories/authRepository'
import { authStorage } from '../../../services/authStorage'
import { AuthContext } from './AuthContextValue'

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
  return {
    token: authResult?.token || null,
    user: authResult?.user || fallbackUser,
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authStorage.getSession())

  const persistSession = useCallback((nextSession) => {
    authStorage.setSession(nextSession)
    setSession(nextSession)
    return nextSession
  }, [])

  const signIn = useCallback(
    async (credentials) => {
      const authResult = await authRepository.login(credentials)
      return persistSession(createSession(authResult, fallbackUserFrom(credentials)))
    },
    [persistSession],
  )

  const signUp = useCallback(
    async (account) => {
      const authResult = await authRepository.signup(account)
      return persistSession(createSession(authResult, fallbackUserFrom(account)))
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

  const value = useMemo(
    () => ({
      session,
      token: session?.token || null,
      user: session?.user || null,
      isAuthenticated: Boolean(session?.token || session?.user),
      signIn,
      signUp,
      signOut,
    }),
    [session, signIn, signOut, signUp],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
