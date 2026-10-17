import { createContext, useContext, useState, useCallback } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('sm_token')
    const role = localStorage.getItem('sm_role')
    const name = localStorage.getItem('sm_name')
    return token ? { token, role, name } : null
  })

  const login = useCallback(async (username, password) => {
    const { data } = await client.post('/auth/login', { username, password })
    localStorage.setItem('sm_token', data.token)
    localStorage.setItem('sm_role', data.role)
    localStorage.setItem('sm_name', data.fullName)
    setAuth({ token: data.token, role: data.role, name: data.fullName })
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('sm_token')
    localStorage.removeItem('sm_role')
    localStorage.removeItem('sm_name')
    setAuth(null)
  }, [])

  // Changing the account's email issues a fresh JWT (the email is the token subject) - swap it in place
  // without a full re-login, so "Security" settings can update it seamlessly.
  const updateToken = useCallback((token) => {
    localStorage.setItem('sm_token', token)
    setAuth((prev) => (prev ? { ...prev, token } : prev))
  }, [])

  return <AuthContext.Provider value={{ auth, login, logout, updateToken }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
