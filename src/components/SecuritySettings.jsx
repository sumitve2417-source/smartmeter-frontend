import { useEffect, useState } from 'react'
import client, { apiErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext.jsx'

/** Shared "update email/phone" + "change password" forms, used by both the tenant and landlord Settings pages. */
export default function SecuritySettings() {
  const { updateToken } = useAuth()
  const [profile, setProfile] = useState({ email: '', phone: '', currentPassword: '' })
  const [profileMsg, setProfileMsg] = useState('')
  const [profileErr, setProfileErr] = useState('')
  const [profileBusy, setProfileBusy] = useState(false)

  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [pwdMsg, setPwdMsg] = useState('')
  const [pwdErr, setPwdErr] = useState('')
  const [pwdBusy, setPwdBusy] = useState(false)

  useEffect(() => {
    client.get('/account/me').then((r) => setProfile((p) => ({ ...p, email: r.data.email, phone: r.data.phone || '' })))
  }, [])

  async function saveProfile(e) {
    e.preventDefault()
    setProfileErr(''); setProfileMsg(''); setProfileBusy(true)
    try {
      const { data } = await client.put('/account/profile', {
        email: profile.email.trim().toLowerCase(), phone: profile.phone.trim(), currentPassword: profile.currentPassword
      })
      updateToken(data.token)
      setProfile((p) => ({ ...p, currentPassword: '' }))
      setProfileMsg('Email & phone updated.')
    } catch (e2) {
      setProfileErr(apiErrorMessage(e2, 'Could not update profile'))
    } finally { setProfileBusy(false) }
  }

  async function savePassword(e) {
    e.preventDefault()
    setPwdErr(''); setPwdMsg('')
    if (pwd.newPassword !== pwd.confirm) { setPwdErr('New passwords do not match'); return }
    if (pwd.newPassword.length < 8) { setPwdErr('New password must be at least 8 characters'); return }
    setPwdBusy(true)
    try {
      await client.put('/account/password', { currentPassword: pwd.currentPassword, newPassword: pwd.newPassword })
      setPwd({ currentPassword: '', newPassword: '', confirm: '' })
      setPwdMsg('Password changed.')
    } catch (e2) {
      setPwdErr(apiErrorMessage(e2, 'Could not change password'))
    } finally { setPwdBusy(false) }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={saveProfile} className="card space-y-3">
        <h2 className="font-semibold text-slate-800">Email &amp; Phone</h2>
        <p className="text-xs text-slate-400">Your email is also your login username. Changing it takes effect immediately.</p>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" value={profile.email}
            onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={profile.phone}
            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} placeholder="10 digit mobile number" />
        </div>
        <div>
          <label className="label">Current password (to confirm)</label>
          <input className="input" type="password" value={profile.currentPassword}
            onChange={(e) => setProfile((p) => ({ ...p, currentPassword: e.target.value }))} required />
        </div>
        {profileErr && <p className="text-sm text-red-600">{profileErr}</p>}
        {profileMsg && <p className="text-sm text-green-600">{profileMsg}</p>}
        <button className="btn-primary w-full" disabled={profileBusy}>{profileBusy ? 'Saving...' : 'Save changes'}</button>
      </form>

      <form onSubmit={savePassword} className="card space-y-3">
        <h2 className="font-semibold text-slate-800">Change Password</h2>
        <div>
          <label className="label">Current password</label>
          <input className="input" type="password" value={pwd.currentPassword}
            onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))} required />
        </div>
        <div>
          <label className="label">New password</label>
          <input className="input" type="password" value={pwd.newPassword} minLength={8}
            onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Confirm new password</label>
          <input className="input" type="password" value={pwd.confirm} minLength={8}
            onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))} required />
        </div>
        {pwdErr && <p className="text-sm text-red-600">{pwdErr}</p>}
        {pwdMsg && <p className="text-sm text-green-600">{pwdMsg}</p>}
        <button className="btn-primary w-full" disabled={pwdBusy}>{pwdBusy ? 'Saving...' : 'Change password'}</button>
      </form>
    </div>
  )
}
