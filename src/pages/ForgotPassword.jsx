import { useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await client.post('/auth/forgot-password', { email: email.trim().toLowerCase() })
    } finally {
      // Always show the same success state, whether or not the email is registered.
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-600 to-brand-900 flex flex-col justify-end sm:justify-center sm:items-center px-6 pb-10 sm:pb-0">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10 mt-16 sm:mt-0">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center text-3xl mb-4">🔑</div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Reset your password</h1>
          <p className="text-brand-100 text-sm mt-1">We'll email you a reset link</p>
        </div>

        {sent ? (
          <div className="card text-center space-y-3">
            <p className="text-slate-700 text-sm">If <b>{email}</b> is registered, a reset link is on its way. Check your inbox (and spam folder).</p>
            <Link to="/login" className="btn-secondary inline-block w-full">Back to Sign in</Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="card space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </div>
            <button className="btn-primary w-full" disabled={loading}>{loading ? 'Sending...' : 'Send reset link'}</button>
            <Link to="/login" className="block text-center text-sm text-slate-500">Back to Sign in</Link>
          </form>
        )}
      </div>
    </div>
  )
}
