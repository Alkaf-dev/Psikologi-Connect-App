import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, session } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => session.getUser())
  const [token, setToken] = useState(() => session.getToken())
  const [booting, setBooting] = useState(() => Boolean(session.getToken() && !session.getUser()))

  const clearSession = useCallback(() => {
    session.clear()
    setToken('')
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const response = await api.get('/auth/me')
    const nextUser = response?.data ?? null
    if (nextUser) {
      session.saveUser(nextUser)
      setUser(nextUser)
    }
    return nextUser
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => clearSession()
    window.addEventListener('psikologi:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('psikologi:unauthorized', handleUnauthorized)
  }, [clearSession])

  useEffect(() => {
    let active = true

    if (!token) {
      setBooting(false)
      return () => {
        active = false
      }
    }

    const cachedUser = session.getUser()

    const boot = async () => {
      try {
        const response = await api.get('/auth/me')
        if (!active) return
        const nextUser = response?.data ?? null
        if (nextUser) {
          session.saveUser(nextUser)
          setUser(nextUser)
        }
      } catch (error) {
        if (active && error?.status === 401) clearSession()
      } finally {
        if (active) setBooting(false)
      }
    }

    const timer = window.setTimeout(boot, cachedUser ? 2500 : 0)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(async ({ login, password, prodiId }) => {
    const response = await api.post(
      '/auth/login',
      {
        login,
        password,
        prodi_id: prodiId,
        device_name: 'Psikologi Connect Web',
        expires_in_days: 30,
      },
      { auth: false },
    )

    if (response?.access_token && response?.user) {
      session.save(response.access_token, response.user)
      setToken(response.access_token)
      setUser(response.user)
      return response.user
    }

    throw new Error('Respons login tidak valid.')
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Token may already be invalid; clear the local session anyway.
    }
    clearSession()
  }, [clearSession])

  const updateLocalUser = useCallback((nextUser) => {
    session.saveUser(nextUser)
    setUser(nextUser)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      booting,
      isAuthenticated: Boolean(user && token),
      isStaff: user?.role === 'super_admin' || user?.role === 'pjmk',
      isStudent: user?.role === 'mahasiswa',
      login,
      logout,
      refreshUser,
      updateLocalUser,
    }),
    [user, token, booting, login, logout, refreshUser, updateLocalUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider.')
  }
  return context
}
