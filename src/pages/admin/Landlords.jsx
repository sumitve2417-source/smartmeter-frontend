import { useEffect, useState, useCallback } from 'react'
import client, { apiErrorMessage } from '../../api/client'
import StatCard from '../../components/StatCard.jsx'

export default function AdminLandlords() {
  const [landlords, setLandlords] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [togglingId, setTogglingId] = useState(null)

  const load = useCallback(async () => {
    setError('')
    const { data } = await client.get('/admin/landlords')
    setLandlords(data)
  }, [])

  useEffect(() => {
    setLoading(true)
    load()
      .catch((e) => setError(apiErrorMessage(e, 'Could not load landlords')))
      .finally(() => setLoading(false))
  }, [load])

  async function toggleActive(landlord) {
    setError('')
    setTogglingId(landlord.id)
    try {
      await client.patch(`/admin/landlords/${landlord.id}/active`, { active: !landlord.active })
      await load()
    } catch (e) {
      setError(apiErrorMessage(e, 'Could not update landlord status'))
    } finally {
      setTogglingId(null)
    }
  }

  const totalCount = landlords.length
  const activeCount = landlords.filter((l) => l.active).length
  const inactiveCount = totalCount - activeCount

  if (loading && landlords.length === 0) {
    return <p className="text-slate-400 text-sm">Loading...</p>
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Landlords" value={totalCount} icon="🏢" />
        <StatCard label="Active" value={activeCount} tone="blue" icon="✅" />
        <StatCard label="Inactive" value={inactiveCount} tone={inactiveCount > 0 ? 'orange' : 'default'} icon="⏸️" />
      </div>

      {error && <div className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}

      <button onClick={() => setShowAdd(true)} className="btn-primary w-full">+ Add Landlord</button>

      <div className="space-y-3">
        {landlords.map((l) => (
          <div key={l.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 truncate">{l.fullName}</p>
                <p className="text-xs text-slate-400 truncate">{l.username}</p>
                <p className="text-xs text-slate-400 mt-0.5">{l.phone || 'No phone'}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleActive(l)}
                disabled={togglingId === l.id}
                className={`pill text-xs font-semibold shrink-0 disabled:opacity-50 ${
                  l.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                }`}
              >
                {togglingId === l.id
                  ? 'Updating...'
                  : l.active
                    ? 'Active · tap to disable'
                    : 'Inactive · tap to enable'}
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Assigned Rooms</span>
              <span className="font-semibold text-slate-700">{l.roomCount ?? 0}</span>
            </div>
          </div>
        ))}

        {landlords.length === 0 && (
          <p className="text-sm text-slate-400 text-center">No landlords yet — tap "+ Add Landlord" above.</p>
        )}
      </div>

      {showAdd && (
        <AddLandlordModal
          onClose={() => setShowAdd(false)}
          onDone={async () => {
            setShowAdd(false)
            await load()
          }}
        />
      )}
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-30 px-0 sm:px-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 text-xl leading-none">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function AddLandlordModal({ onClose, onDone }) {
  const [form, setForm] = useState({ fullName: '', phone: '', username: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await client.post('/admin/landlords', {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        username: form.username.trim().toLowerCase(),
        password: form.password
      })
      await onDone()
    } catch (e2) {
      setError(apiErrorMessage(e2, 'Could not add landlord'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title="Add Landlord" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="label">Full name</label>
          <input className="input" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} required />
        </div>
        <div>
          <label className="label">Phone (10 digits)</label>
          <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)}
            pattern="[0-9]{10}" placeholder="9876543210" required />
        </div>
        <div>
          <label className="label">Email (used as login)</label>
          <input className="input" type="email" value={form.username} onChange={(e) => set('username', e.target.value)}
            placeholder="landlord@example.com" required />
        </div>
        <div>
          <label className="label">Password (min 8 chars)</label>
          <input className="input" type="password" value={form.password} onChange={(e) => set('password', e.target.value)}
            minLength={8} required />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Creating...' : 'Create Landlord'}</button>
      </form>
    </Modal>
  )
}