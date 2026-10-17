import { useEffect, useState, useCallback } from 'react'
import client, { apiErrorMessage } from '../../api/client'

export default function LandlordRooms() {
  const [rooms, setRooms] = useState([])
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [onboardFor, setOnboardFor] = useState(null) // room being onboarded
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => client.get('/landlord/rooms').then((r) => setRooms(r.data)), [])
  useEffect(() => { load() }, [load])

  async function toggleRelay(room) {
    setError('')
    try {
      await client.post(`/landlord/rooms/${room.id}/relay`, { on: !room.relayOn })
      load()
    } catch (e) { setError(apiErrorMessage(e)) }
  }

  async function vacate(room) {
    if (!confirm(`Vacate ${room.name}? This blocks the tenant's login and cuts power.`)) return
    setError('')
    try {
      await client.post(`/landlord/rooms/${room.id}/vacate`)
      load()
    } catch (e) { setError(apiErrorMessage(e)) }
  }

  return (
    <div className="space-y-5">
      {error && <div className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}

      <button onClick={() => setShowAddRoom(true)} className="btn-primary w-full">+ Add Room / Meter</button>

      <div className="space-y-3">
        {rooms.map((r) => (
          <div key={r.id} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">{r.name}</p>
                <p className="text-xs text-slate-400">{r.deviceId}</p>
              </div>
              {r.tenantId ? (
                <button onClick={() => toggleRelay(r)}
                  className={`pill text-xs font-semibold ${r.relayOn ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {r.relayOn ? 'ON · tap to cut' : 'CUT · tap to restore'}
                </button>
              ) : (
                <span className="pill text-xs bg-slate-100 text-slate-500">Vacant</span>
              )}
            </div>

            {r.tenantId ? (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
                <div>
                  <p className="text-slate-700 font-medium">{r.tenantName}</p>
                  <p className="text-xs text-slate-400">Balance ₹{Number(r.balance ?? 0).toFixed(2)}</p>
                </div>
                <button onClick={() => vacate(r)} className="text-xs text-red-500 font-medium">Vacate</button>
              </div>
            ) : (
              <button onClick={() => setOnboardFor(r)} className="btn-secondary w-full mt-3 text-sm">Onboard Tenant</button>
            )}
          </div>
        ))}
        {rooms.length === 0 && <p className="text-sm text-slate-400 text-center">No rooms yet.</p>}
      </div>

      {showAddRoom && <AddRoomModal onClose={() => setShowAddRoom(false)} onDone={() => { setShowAddRoom(false); load() }} />}
      {onboardFor && <OnboardModal room={onboardFor} onClose={() => setOnboardFor(null)} onDone={() => { setOnboardFor(null); load() }} />}
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-30 px-0 sm:px-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function AddRoomModal({ onClose, onDone }) {
  const [name, setName] = useState('')
  const [deviceId, setDeviceId] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      await client.post('/landlord/rooms', { name: name.trim(), deviceId: deviceId.trim() })
      onDone()
    } catch (e2) { setError(apiErrorMessage(e2, 'Could not add room')) } finally { setBusy(false) }
  }

  return (
    <Modal title="Add Room" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="label">Room name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Room 1" required />
        </div>
        <div>
          <label className="label">Meter / Device ID</label>
          <input className="input" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} placeholder="SIM-001 or ESP32-001" required />
          <p className="text-xs text-slate-400 mt-1">Must match the ID your ESP32 (or simulator) publishes on MQTT.</p>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Adding...' : 'Add Room'}</button>
      </form>
    </Modal>
  )
}

function OnboardModal({ room, onClose, onDone }) {
  const [form, setForm] = useState({ fullName: '', phone: '', username: '', password: '', openingBalance: '0' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  async function submit(e) {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      await client.post('/landlord/tenants', {
        fullName: form.fullName.trim(), phone: form.phone.trim(), username: form.username.trim().toLowerCase(),
        password: form.password, roomId: room.id, openingBalance: Number(form.openingBalance || 0)
      })
      onDone()
    } catch (e2) { setError(apiErrorMessage(e2, 'Could not onboard tenant')) } finally { setBusy(false) }
  }

  return (
    <Modal title={`Onboard tenant · ${room.name}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div><label className="label">Full name</label>
          <input className="input" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} required /></div>
        <div><label className="label">Phone (10 digits)</label>
          <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} required /></div>
        <div><label className="label">Email (used as login)</label>
          <input className="input" type="email" value={form.username} onChange={(e) => set('username', e.target.value)}
            placeholder="tenant@example.com" required /></div>
        <div><label className="label">Password</label>
          <input className="input" type="password" value={form.password} onChange={(e) => set('password', e.target.value)}
            minLength={8} required /></div>
        <div><label className="label">Opening balance (₹)</label>
          <input className="input" type="number" min="0" step="0.01" value={form.openingBalance}
            onChange={(e) => set('openingBalance', e.target.value)} /></div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Onboarding...' : 'Onboard Tenant'}</button>
      </form>
    </Modal>
  )
}
