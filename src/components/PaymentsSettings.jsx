import { useEffect, useState, useRef } from 'react'
import client, { apiErrorMessage } from '../api/client'

export default function PaymentsSettings() {
  const [form, setForm] = useState({ upiId: '', payeeName: '', tariffPerKwh: '', minBalance: '' })
  const [qrPreview, setQrPreview] = useState(null)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef(null)

  useEffect(() => {
    client.get('/landlord/settings').then((r) => {
      setForm({
        upiId: r.data.upiId || '', payeeName: r.data.payeeName || '',
        tariffPerKwh: r.data.tariffPerKwh ?? '', minBalance: r.data.minBalance ?? ''
      })
      setQrPreview(r.data.qrDataUrl)
    })
  }, [])

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })) }

  async function save(e) {
    e.preventDefault()
    setError(''); setMsg(''); setBusy(true)
    try {
      await client.put('/landlord/settings', {
        upiId: form.upiId.trim(), payeeName: form.payeeName.trim(),
        tariffPerKwh: Number(form.tariffPerKwh), minBalance: Number(form.minBalance)
      })
      setMsg('Settings saved.')
    } catch (e2) { setError(apiErrorMessage(e2, 'Could not save settings')) } finally { setBusy(false) }
  }

  async function uploadQr(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(''); setBusy(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await client.post('/landlord/settings/qr', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setQrPreview(data.qrDataUrl)
      setMsg('QR code updated.')
    } catch (e2) { setError(apiErrorMessage(e2, 'Could not upload QR')) } finally { setBusy(false) }
  }

  return (
    <div className="space-y-5">
      <form onSubmit={save} className="card space-y-4">
        <h2 className="font-semibold text-slate-800">Payments &amp; Tariff</h2>
        <div>
          <label className="label">UPI ID</label>
          <input className="input" value={form.upiId} onChange={(e) => set('upiId', e.target.value)} placeholder="you@bank" required />
        </div>
        <div>
          <label className="label">Payee name</label>
          <input className="input" value={form.payeeName} onChange={(e) => set('payeeName', e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Tariff (₹/kWh)</label>
            <input className="input" type="number" min="0.01" step="0.01" value={form.tariffPerKwh}
              onChange={(e) => set('tariffPerKwh', e.target.value)} required />
          </div>
          <div>
            <label className="label">Minimum balance (₹)</label>
            <input className="input" type="number" min="0" step="0.01" value={form.minBalance}
              onChange={(e) => set('minBalance', e.target.value)} required />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {msg && <p className="text-sm text-green-600">{msg}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Saving...' : 'Save Settings'}</button>
      </form>

      <div className="card text-center">
        <h2 className="font-semibold text-slate-800 mb-3">UPI QR Code</h2>
        {qrPreview
          ? <img src={qrPreview} alt="UPI QR" className="w-40 h-40 mx-auto rounded-lg border border-slate-100 mb-3" />
          : <p className="text-sm text-slate-400 mb-3">No QR uploaded yet.</p>}
        <input ref={fileRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={uploadQr} />
        <button onClick={() => fileRef.current?.click()} className="btn-secondary" disabled={busy}>Upload QR (PNG/JPEG)</button>
      </div>
    </div>
  )
}
