import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts'

/** Circular gauge showing live power draw, styled like the reference app's "Current Power" card. */
export default function PowerGauge({ watts = 0, maxWatts = 3000, relayOn = true }) {
  const pct = Math.min(100, Math.round((watts / maxWatts) * 100))
  const data = [{ name: 'power', value: relayOn ? pct : 0, fill: relayOn ? '#ffffff' : '#93a3c7' }]
  const kw = (watts / 1000).toFixed(watts >= 1000 ? 1 : 2)

  return (
    <div className="rounded-xl2 bg-gradient-to-br from-brand-500 to-brand-700 text-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">{relayOn ? `${kw}kW` : 'OFF'}</p>
          <p className="text-brand-100 text-xs mt-1">Current Power</p>
        </div>
        <div className="relative w-28 h-28 -my-3">
          <RadialBarChart width={112} height={112} innerRadius="72%" outerRadius="100%" data={data}
            startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar background={{ fill: 'rgba(255,255,255,0.18)' }} clockWise dataKey="value" cornerRadius={8} />
          </RadialBarChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold">{relayOn ? `${pct}%` : '0%'}</span>
            <span className="text-[10px] text-brand-100">Power</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">{relayOn ? 'ON' : 'CUT'}</p>
          <p className="text-brand-100 text-xs mt-1">Relay Status</p>
        </div>
      </div>
    </div>
  )
}
