'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

const parseJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const binary = atob(base64)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    const decoded = new TextDecoder().decode(bytes)

    return JSON.parse(decoded)
  } catch {
    return null
  }
}

const isTokenExpired = (token) => {
  const payload = parseJwtPayload(token)
  if (!payload?.exp) return false
  return payload.exp * 1000 <= Date.now()
}

const normalizeUser = (userData, authToken) => {
  const payload = authToken ? parseJwtPayload(authToken) : null

  return {
    id: userData?.id || payload?.userId || '',
    email: userData?.email || payload?.email || '',
    role: userData?.role || payload?.role || 'user',
    firstName:
      payload?.firstName ||
      payload?.first_name ||
      userData?.firstName ||
      userData?.first_name ||
      '',
    lastName:
      payload?.lastName ||
      payload?.last_name ||
      userData?.lastName ||
      userData?.last_name ||
      '',
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY)
      const storedToken = localStorage.getItem(TOKEN_KEY)

      if (!storedUser || !storedToken) {
        return
      }

      if (isTokenExpired(storedToken)) {
        localStorage.removeItem(USER_KEY)
        localStorage.removeItem(TOKEN_KEY)
        return
      }

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser)
        const normalizedUser = normalizeUser(parsedUser, storedToken)

        setUser(normalizedUser)
        setToken(storedToken)
        setIsAuthenticated(true)
        localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser))
      }
    } catch (error) {
      console.error('Error loading user from storage:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = (userData, authToken) => {
    const normalizedUser = normalizeUser(userData, authToken)

    setUser(normalizedUser)
    if (authToken) {
      setToken(authToken)
      localStorage.setItem(TOKEN_KEY, authToken)
    }
    setIsAuthenticated(true)
    localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setIsAuthenticated(false)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKEN_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
