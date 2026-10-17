import { useEffect, useState, useCallback } from 'react'
import client, { apiErrorMessage } from '../../api/client'

export default function LandlordRecharges() {
  const [status, setStatus] = useState('PENDING')
  const [list, setList] = useState([])
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(() => client.get('/landlord/recharges', { params: { status } }).then((r) => setList(r.data)), [status])
  useEffect(() => { load() }, [load])

  async function act(id, action) {
    setError(''); setBusyId(id)
    try {
      await client.post(`/landlord/recharges/${id}/${action}`)
      load()
    } catch (e) { setError(apiErrorMessage(e)) } finally { setBusyId(null) }
  }

  return (
    <div className="space-y-5">
      <div className="inline-flex bg-slate-100 rounded-full p-1">
        {['PENDING', 'APPROVED', 'REJECTED'].map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`pill text-xs ${status === s ? 'pill-active' : 'pill-inactive'}`}>{s}</button>
        ))}
      </div>

      {error && <div className="rounded-xl bg-red-50 text-red-700 text-sm px-4 py-3">{error}</div>}

      <div className="space-y-3">
        {list.map((r) => (
          <div key={r.id} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">{r.tenantName}</p>
                <p className="text-xs text-slate-400">{r.room} · {new Date(r.createdAt).toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-0.5">UTR: {r.utr}</p>
              </div>
              <p className="text-lg font-bold text-slate-800">₹{Number(r.amount).toFixed(2)}</p>
            </div>
            {status === 'PENDING' && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                <button onClick={() => act(r.id, 'approve')} disabled={busyId === r.id}
                  className="btn-primary flex-1 !py-2 text-sm">Approve</button>
                <button onClick={() => act(r.id, 'reject')} disabled={busyId === r.id}
                  className="btn-secondary flex-1 !py-2 text-sm">Reject</button>
              </div>
            )}
          </div>
        ))}
        {list.length === 0 && <p className="text-sm text-slate-400 text-center">No {status.toLowerCase()} recharges.</p>}
      </div>
    </div>
  )
}
