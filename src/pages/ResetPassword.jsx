import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import client, { apiErrorMessage } from '../api/client'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const email = params.get('email') || ''
  const token = params.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await client.post('/auth/reset-password', { email, token, newPassword: password })
      setDone(true)
      setTimeout(() => nav('/login', { replace: true }), 2000)
    } catch (err) {
      setError(apiErrorMessage(err, 'This reset link is invalid or has expired.'))
    } finally {
      setLoading(false)
    }
  }

  if (!email || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brand-600 to-brand-900 flex items-center justify-center px-6">
        <div className="card max-w-sm text-center space-y-3">
          <p className="text-slate-700 text-sm">This reset link looks incomplete. Request a new one from the login page.</p>
          <Link to="/forgot-password" className="btn-primary inline-block w-full">Request reset link</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-600 to-brand-900 flex flex-col justify-end sm:justify-center sm:items-center px-6 pb-10 sm:pb-0">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10 mt-16 sm:mt-0">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center text-3xl mb-4">🔒</div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Set a new password</h1>
          <p className="text-brand-100 text-sm mt-1">{email}</p>
        </div>

        {done ? (
          <div className="card text-center space-y-2">
            <p className="text-green-600 font-medium text-sm">Password updated. Redirecting to sign in...</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="card space-y-4">
            <div>
              <label className="label">New password</label>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </div>
            <div>
              <label className="label">Confirm new password</label>
              <input className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button className="btn-primary w-full" disabled={loading}>{loading ? 'Saving...' : 'Update password'}</button>
          </form>
        )}
      </div>
    </div>
  )
}
