import { useEffect, useState, useCallback } from 'react'
import client from '../../api/client'

function formatPeriod(ym) {
  const [y, m] = ym.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export default function TenantBill() {
  const [periods, setPeriods] = useState([])
  const [selected, setSelected] = useState(null)
  const [bill, setBill] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    client.get('/tenant/bills').then((r) => {
      setPeriods(r.data)
      if (r.data.length) setSelected(r.data[0])
    })
  }, [])

  const loadBill = useCallback(async (period) => {
    setLoading(true); setError('')
    try {
      const { data } = await client.get(`/tenant/bills/${period}`)
      setBill(data)
    } catch {
      setBill(null)
      setError('No usage recorded for this period yet.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { if (selected) loadBill(selected) }, [selected, loadBill])

  async function download() {
    const res = await client.get(`/tenant/bills/${selected}/pdf`, { responseType: 'blob' })
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
    const a = document.createElement('a')
    a.href = url; a.download = `bill-${selected}.pdf`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-3">Select month</h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {periods.map((p) => (
            <button key={p} onClick={() => setSelected(p)}
              className={`pill whitespace-nowrap ${selected === p ? 'pill-active bg-brand-50 text-brand-700' : 'pill-inactive bg-slate-100'}`}>
              {formatPeriod(p)}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-slate-400 text-sm">Loading bill...</p>}
      {error && <div className="card text-sm text-slate-500">{error}</div>}

      {bill && !loading && (
        <div className="card">
          <div className="text-center border-b border-slate-100 pb-4 mb-4">
            <p className="text-xs text-slate-400">Electricity Bill</p>
            <h2 className="text-lg font-bold text-slate-800">{bill.period}</h2>
            <p className="text-xs text-slate-400 mt-1">{bill.room} · {bill.tenantName}</p>
          </div>

          <dl className="space-y-2.5 text-sm">
            <Row label="Old Balance" value={`₹${Number(bill.oldBalance).toFixed(2)}`} />
            <Row label="Recharged this month" value={`₹${Number(bill.recharged).toFixed(2)}`} valueClass="text-green-600" />
            <Row label="Units Consumed" value={`${bill.consumedKwh.toFixed(2)} kWh`} />
            <Row label="Tariff" value={`₹${Number(bill.tariffPerKwh).toFixed(2)}/kWh`} />
            <Row label="Amount for consumption" value={`₹${Number(bill.consumedAmount).toFixed(2)}`} valueClass="text-red-500" />
          </dl>

          <div className="border-t border-slate-100 mt-4 pt-4 flex items-center justify-between">
            <span className="font-semibold text-slate-800">New Balance</span>
            <span className="text-xl font-bold text-slate-800">₹{Number(bill.newBalance).toFixed(2)}</span>
          </div>

          <button onClick={download} className="btn-primary w-full mt-5">⬇ Download PDF</button>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, valueClass = 'text-slate-700' }) {
  return (
    <div className="flex justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`font-medium ${valueClass}`}>{value}</dd>
    </div>
  )
}
