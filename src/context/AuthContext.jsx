import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, session } from '../lib/api'

const AuthContext = createContext(null)

function enrichUser(userData) {
  if (!userData) return null
  const key = userData.id || userData.email
  let enriched = { ...userData }
  try {
    const localAvatar = localStorage.getItem('psikologi_avatar_' + key)
    if (localAvatar) {
      enriched.avatar_url = localAvatar
    }
    const localCover = localStorage.getItem('psikologi_cover_' + key)
    if (localCover) {
      enriched.cover_url = localCover
    }
    const localCoverPosX = localStorage.getItem('psikologi_cover_pos_x_' + key)
    if (localCoverPosX !== null && localCoverPosX !== '') {
      enriched.cover_pos_x = Number(localCoverPosX)
    }
    const localCoverPosY = localStorage.getItem('psikologi_cover_pos_' + key)
    if (localCoverPosY !== null && localCoverPosY !== '') {
      enriched.cover_pos = Number(localCoverPosY)
      enriched.cover_pos_y = Number(localCoverPosY)
    }
    const localCoverZoom = localStorage.getItem('psikologi_cover_zoom_' + key)
    if (localCoverZoom !== null && localCoverZoom !== '') {
      enriched.cover_zoom = Number(localCoverZoom)
    }
  } catch {}
  return enriched
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => enrichUser(session.getUser()))
  const [token, setToken] = useState(() => session.getToken())
  const [booting, setBooting] = useState(() => Boolean(session.getToken() && !session.getUser()))

  const clearSession = useCallback(() => {
    session.clear()
    setToken('')
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const response = await api.get('/auth/me')
    const nextUser = enrichUser(response?.data ?? null)
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
        const nextUser = enrichUser(response?.data ?? null)
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

  const login = useCallback(async ({ login, password, prodiId, rememberMe = true }) => {
    const response = await api.post(
      '/auth/login',
      {
        login,
        password,
        prodi_id: prodiId,
        device_name: 'Psikologi Connect Web',
        expires_in_days: rememberMe ? 30 : 1,
      },
      { auth: false },
    )

    if (response?.access_token && response?.user) {
      const enriched = enrichUser(response.user)
      session.save(response.access_token, enriched)
      setToken(response.access_token)
      setUser(enriched)
      return enriched
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
    const enriched = enrichUser(nextUser)
    session.saveUser(enriched)
    setUser(enriched)
  }, [])

  const [activeRole, setActiveRoleState] = useState(() => {
    try {
      return localStorage.getItem('psikologi_active_role') || 'staff'
    } catch {
      return 'staff'
    }
  })

  const isStaff = Boolean(
    user && (user.role === 'super_admin' || user.role === 'pjmk' || user.is_staff || user.is_admin),
  )
  const isMultiRole = isStaff
  const isStudent = true

  const switchRole = useCallback((newRole) => {
    try {
      localStorage.setItem('psikologi_active_role', newRole)
    } catch {}
    setActiveRoleState(newRole)
    return newRole === 'staff' ? '/admin' : '/portal'
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      booting,
      isAuthenticated: Boolean(user && token),
      isStaff,
      isStudent,
      isMultiRole,
      roles: isStaff ? ['admin', 'mahasiswa'] : ['mahasiswa'],
      activeRole: isMultiRole ? activeRole : 'student',
      switchRole,
      login,
      logout,
      refreshUser,
      updateLocalUser,
    }),
    [user, token, booting, isStaff, isStudent, isMultiRole, activeRole, switchRole, login, logout, refreshUser, updateLocalUser],
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
