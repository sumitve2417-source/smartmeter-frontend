import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { apiErrorMessage } from '../api/client'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(username.trim().toLowerCase(), password)
      nav(data.role === 'LANDLORD' ? '/landlord' : '/tenant', { replace: true })
    } catch (err) {
      setError(apiErrorMessage(err, 'Invalid email or password'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-600 to-brand-900 flex flex-col justify-end sm:justify-center sm:items-center px-6 pb-10 sm:pb-0">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10 mt-16 sm:mt-0">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center text-3xl mb-4">⚡</div>
          <h1 className="text-white text-2xl font-bold tracking-tight">SmartMeter</h1>
          <p className="text-brand-100 text-sm mt-1">Prepaid electricity, made simple</p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={username} onChange={(e) => setUsername(e.target.value)}
              autoCapitalize="none" autoComplete="username" required />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="label mb-0">Password</label>
              <Link to="/forgot-password" className="text-xs text-brand-600 font-medium">Forgot password?</Link>
            </div>
            <input className="input mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password" required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        </form>
        <p className="text-center text-brand-100 text-xs mt-6">Tenants: ask your landlord for your login details.</p>
      </div>
    </div>
  )
}
