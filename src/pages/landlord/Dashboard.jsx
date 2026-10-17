import { useEffect, useState, useCallback } from 'react'
import client from '../../api/client'
import RangeTabs from '../../components/RangeTabs.jsx'
import ConsumptionChart from '../../components/ConsumptionChart.jsx'
import StatCard from '../../components/StatCard.jsx'

export default function LandlordDashboard() {
  const [rooms, setRooms] = useState([])
  const [range, setRange] = useState('month')
  const [chart, setChart] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [r, c] = await Promise.all([
      client.get('/landlord/rooms'),
      client.get('/landlord/analytics', { params: { range } })
    ])
    setRooms(r.data); setChart(c.data)
  }, [range])

  useEffect(() => {
    setLoading(true)
    load().finally(() => setLoading(false))
    const id = setInterval(load, 15000)
    return () => clearInterval(id)
  }, [load])

  const occupied = rooms.filter((r) => r.tenantId).length
  const cut = rooms.filter((r) => r.tenantId && !r.relayOn).length

  if (loading && rooms.length === 0) return <p className="text-slate-400 text-sm">Loading...</p>

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Rooms" value={rooms.length} icon="🏠" />
        <StatCard label="Occupied" value={occupied} icon="🧑" />
        <StatCard label="Power Cut" value={cut} tone={cut > 0 ? 'orange' : 'default'} icon="⚡" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">Revenue &amp; Consumption</h2>
          <RangeTabs value={range} onChange={setRange} />
        </div>
        <ConsumptionChart range={range} points={chart?.points} />
        <div className="flex justify-between text-sm text-slate-500 mt-2 pt-3 border-t border-slate-100">
          <span>Total: <b className="text-slate-700">{chart?.totalKwh?.toFixed?.(2) ?? 0} kWh</b></span>
          <span>Revenue: <b className="text-slate-700">₹{Number(chart?.totalRevenue ?? 0).toFixed(2)}</b></span>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-3">Rooms Overview</h2>
        <ul className="divide-y divide-slate-100">
          {rooms.map((r) => (
            <li key={r.id} className="py-3 flex items-center justify-between text-sm">
              <div>
                <p className="font-medium text-slate-700">{r.name}</p>
                <p className="text-xs text-slate-400">{r.tenantName || 'Vacant'} {r.deviceId ? `· ${r.deviceId}` : ''}</p>
              </div>
              <div className="text-right">
                {r.tenantId ? (
                  <>
                    <p className="font-semibold text-slate-700">₹{Number(r.balance ?? 0).toFixed(2)}</p>
                    <p className={`text-xs ${r.relayOn ? 'text-green-600' : 'text-red-500'}`}>{r.relayOn ? 'Power ON' : 'Power CUT'}</p>
                  </>
                ) : <span className="text-xs text-slate-400">Vacant</span>}
              </div>
            </li>
          ))}
          {rooms.length === 0 && <p className="text-sm text-slate-400">No rooms yet - add one in the Rooms tab.</p>}
        </ul>
      </div>
    </div>
  )
}
