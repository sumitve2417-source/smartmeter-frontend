import { useEffect, useState, useCallback } from 'react'
import client from '../../api/client'
import PowerGauge from '../../components/PowerGauge.jsx'
import RangeTabs from '../../components/RangeTabs.jsx'
import ConsumptionChart from '../../components/ConsumptionChart.jsx'
import StatCard from '../../components/StatCard.jsx'

export default function TenantDashboard() {
  const [dash, setDash] = useState(null)
  const [range, setRange] = useState('month')
  const [chart, setChart] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [d, c] = await Promise.all([
      client.get('/tenant/dashboard'),
      client.get('/tenant/consumption', { params: { range } })
    ])
    setDash(d.data)
    setChart(c.data)
  }, [range])

  useEffect(() => {
    setLoading(true)
    load().finally(() => setLoading(false))
    const id = setInterval(load, 10000) // live-ish refresh every 10s
    return () => clearInterval(id)
  }, [load])

  if (loading && !dash) return <p className="text-slate-400 text-sm">Loading...</p>

  return (
    <div className="space-y-5">
      {dash?.lowBalance && (
        <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3">
          ⚠️ Your balance is low{dash.relayOn ? '' : ' and power has been cut'}. Recharge soon to avoid disconnection.
        </div>
      )}

      <PowerGauge watts={dash?.currentPowerW || 0} relayOn={dash?.relayOn ?? true} />

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Wallet Balance" value={`₹${Number(dash?.balance ?? 0).toFixed(2)}`} tone="orange" icon="👛" />
        <StatCard label="Tariff" value={`₹${Number(dash?.tariffPerKwh ?? 0).toFixed(2)}/kWh`} tone="blue" icon="⚡" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">Consumption</h2>
          <RangeTabs value={range} onChange={setRange} />
        </div>
        <ConsumptionChart range={range} points={chart?.points} />
        <div className="flex justify-between text-sm text-slate-500 mt-2 pt-3 border-t border-slate-100">
          <span>Total: <b className="text-slate-700">{chart?.totalKwh?.toFixed?.(2) ?? 0} kWh</b></span>
          <span>Cost: <b className="text-slate-700">₹{Number(chart?.totalRevenue ?? 0).toFixed(2)}</b></span>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400">Room: {dash?.room || '-'}</p>
    </div>
  )
}
