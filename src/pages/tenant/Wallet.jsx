import { useEffect, useState, useCallback } from 'react'
import client, { apiErrorMessage } from '../../api/client'

function buildUpiLink(upiId, payeeName, amount) {
  const params = new URLSearchParams()
  params.set('pa', upiId)
  params.set('pn', payeeName)
  params.set('cu', 'INR')
  // Many UPI apps silently ignore the intent if 'am' (amount) is missing - always include it when known.
  if (amount) params.set('am', Number(amount).toFixed(2))
  params.set('tn', 'Electricity wallet recharge')
  return `upi://pay?${params.toString()}`
}

export default function TenantWallet() {
  const [dash, setDash] = useState(null)
  const [payment, setPayment] = useState(null)
  const [txns, setTxns] = useState([])
  const [recharges, setRecharges] = useState([])
  const [amount, setAmount] = useState('')
  const [utr, setUtr] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [payHint, setPayHint] = useState('')

  const load = useCallback(async () => {
    const [d, p, t, r] = await Promise.all([
      client.get('/tenant/dashboard'),
      client.get('/tenant/payment-info').catch(() => ({ data: null })),
      client.get('/tenant/transactions'),
      client.get('/tenant/recharges')
    ])
    setDash(d.data); setPayment(p.data); setTxns(t.data); setRecharges(r.data)
  }, [])

  useEffect(() => { load() }, [load])

  function payNow() {
    setPayHint('')
    if (!amount || Number(amount) <= 0) { setPayHint('Enter an amount first.'); return }
    const link = buildUpiLink(payment.upiId, payment.payeeName, amount)
    // A plain top-level navigation is what actually triggers the "open with <UPI app>" chooser on mobile.
    window.location.href = link
    // On desktop (or if no UPI app is installed) nothing will visibly happen - that's expected, not a bug;
    // scanning the QR code is the reliable path there.
    setPayHint('If nothing opened, your device has no UPI app installed - scan the QR code instead.')
  }

  async function copyUpiId() {
    try {
      await navigator.clipboard.writeText(payment.upiId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard blocked - ignore, the ID is already shown on screen to copy manually */ }
  }

  async function submitRecharge(e) {
    e.preventDefault()
    setErr(''); setMsg(''); setBusy(true)
    try {
      await client.post('/tenant/recharges', { amount: Number(amount), utr: utr.trim().toUpperCase() })
      setMsg('Recharge submitted - your landlord will approve it shortly.')
      setAmount(''); setUtr('')
      load()
    } catch (e2) {
      setErr(apiErrorMessage(e2, 'Could not submit recharge'))
    } finally { setBusy(false) }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl2 bg-gradient-to-br from-orange-400 to-orange-600 text-white p-5 shadow-card">
        <p className="text-orange-50 text-xs">Wallet Balance</p>
        <p className="text-3xl font-bold mt-1">₹{Number(dash?.balance ?? 0).toFixed(2)}</p>
        <p className="text-orange-50 text-xs mt-2">Minimum balance ₹{Number(dash?.minBalance ?? 0).toFixed(2)} - power is cut below this</p>
      </div>

      {payment?.upiId ? (
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-3 text-center">Pay via UPI</h2>
          {payment.qrDataUrl && (
            <img src={payment.qrDataUrl} alt="UPI QR" className="w-44 h-44 mx-auto rounded-lg border border-slate-100" />
          )}
          <div className="flex items-center justify-center gap-2 mt-3">
            <p className="text-sm text-slate-600">{payment.upiId}</p>
            <button onClick={copyUpiId} className="text-xs text-brand-600 font-medium">{copied ? 'Copied!' : 'Copy'}</button>
          </div>
          <p className="text-xs text-slate-400 text-center">{payment.payeeName}</p>

          <div className="mt-4">
            <label className="label">Amount to pay (₹)</label>
            <input className="input" type="number" min="1" step="0.01" value={amount}
              onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 200" />
          </div>
          <button onClick={payNow} className="btn-primary w-full mt-3">Pay Now</button>
          {payHint && <p className="text-xs text-slate-400 text-center mt-2">{payHint}</p>}
          <p className="text-xs text-slate-400 text-center mt-2">
            On a phone this opens your UPI app (Google Pay, PhonePe, Paytm...). On a computer, scan the QR
            with your phone instead.
          </p>
        </div>
      ) : (
        <div className="card text-sm text-slate-500">Your landlord hasn't set up UPI payments yet.</div>
      )}

      <form onSubmit={submitRecharge} className="card space-y-3">
        <h2 className="font-semibold text-slate-800">Submit Recharge</h2>
        <p className="text-xs text-slate-400">After paying, confirm the amount and enter the UPI transaction id (UTR) so your landlord can approve it.</p>
        <div>
          <label className="label">Amount (₹)</label>
          <input className="input" type="number" min="1" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div>
          <label className="label">UPI Transaction ID (UTR)</label>
          <input className="input" value={utr} onChange={(e) => setUtr(e.target.value)} required />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        {msg && <p className="text-sm text-green-600">{msg}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Submitting...' : 'Submit Recharge'}</button>
      </form>

      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-3">Recharge Requests</h2>
        <ul className="divide-y divide-slate-100">
          {recharges.length === 0 && <p className="text-sm text-slate-400">No recharges yet.</p>}
          {recharges.map((r) => (
            <li key={r.id} className="py-2.5 flex items-center justify-between text-sm">
              <div>
                <p className="font-medium text-slate-700">₹{Number(r.amount).toFixed(2)}</p>
                <p className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleString()}</p>
              </div>
              <span className={`pill text-xs ${r.status === 'APPROVED' ? 'bg-green-50 text-green-700' : r.status === 'REJECTED' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                {r.status}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-3">Transaction History</h2>
        <ul className="divide-y divide-slate-100">
          {txns.length === 0 && <p className="text-sm text-slate-400">No transactions yet.</p>}
          {txns.map((t, i) => (
            <li key={i} className="py-2.5 flex items-center justify-between text-sm">
              <div>
                <p className="font-medium text-slate-700">{t.type === 'RECHARGE' ? 'Recharge' : t.type === 'USAGE' ? 'Usage' : 'Adjustment'}</p>
                <p className="text-xs text-slate-400">{new Date(t.createdAt).toLocaleString()} {t.reference ? `· ${t.reference}` : ''}</p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${Number(t.amount) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {Number(t.amount) >= 0 ? '+' : ''}₹{Number(t.amount).toFixed(2)}
                </p>
                <p className="text-xs text-slate-400">Bal ₹{Number(t.balanceAfter).toFixed(2)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
