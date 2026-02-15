import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '../types'
import { cookieManager } from '../utils/cookieManager'
import { authService } from '../services/authService'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (username: string, email: string, password: string) => Promise<User>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function normalizeUser(obj: any): User | null {
  if (!obj || typeof obj !== 'object') return null
  return {
    ...obj,
    _id: obj._id || obj.id,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth state in cookies
    const stored = cookieManager.get('typeracer_user')
    if (stored) {
      try {
        setUser(normalizeUser(JSON.parse(stored)))
      } catch {
        // Invalid cookie, clear it
        cookieManager.delete('typeracer_user')
      }
    }
    setLoading(false)
  }, [])

  // Refresh user from server when we have a stored session (so stats and profile are up to date)
  useEffect(() => {
    if (!user?._id) return
    authService
      .getMe()
      .then((data) => {
        const fresh = data?.user ?? data
        if (fresh && typeof fresh === 'object') {
          const normalized = normalizeUser(fresh)
          if (normalized) setUser(normalized)
        }
      })
      .catch(() => {})
  }, [user?._id])

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password)
    // authService.login may return { user, accessToken } or just tokens.
    let userObj = response?.user || response
    if (!userObj && response?.accessToken) {
      // try fetching current user from API
      try {
        const me = await authService.getMe()
        userObj = me.user || me
      } catch (err) {
        // ignore - login still succeeded token-wise
      }
    }
    const normalized = normalizeUser(userObj)
    if (normalized) {
      setUser(normalized)
      cookieManager.setSecure('typeracer_user', JSON.stringify(normalized))
    }
    return normalized as User
  }

  const register = async (username: string, email: string, password: string) => {
    const response = await authService.register(username, email, password)
    let userObj = response?.user || response
    if (!userObj && response?.accessToken) {
      try {
        const me = await authService.getMe()
        userObj = me.user || me
      } catch (err) {
        // ignore
      }
    }
    const normalized = normalizeUser(userObj)
    if (normalized) {
      setUser(normalized)
      cookieManager.setSecure('typeracer_user', JSON.stringify(normalized))
    }
    return normalized as User
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch {
      // Continue logout even if API call fails
    }
    setUser(null)
    cookieManager.delete('typeracer_user')
  }

  const updateUser = (updates: Partial<User>) => {
    if (!user) return
    const updated = { ...user, ...updates } as User
    setUser(updated)
    cookieManager.setSecure('typeracer_user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
