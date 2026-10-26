import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

/**
 * Day view -> smooth line (matches the intraday power curve reference).
 * Month/Year/Total view -> bar chart, orange gradient (matches the reference app).
 */
export default function ConsumptionChart({ range, points }) {
  if (!points || points.length === 0) {
    return <div className="h-56 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
  }

  if (range === 'day') {
    return (
      <ResponsiveContainer width="100%" height={230}>
        <LineChart data={points} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f6" />
          <XAxis 
            dataKey="label" 
            tick={{ fontSize: 10, fill: '#94a3b8' }} 
            interval={2} 
            axisLine={false} 
            tickLine={false} 
            tickFormatter={(val) => val.includes(':') ? val.split(':')[0] : val}
          />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
          <Tooltip formatter={(v) => [`${v} kWh`, 'Used']} labelStyle={{ fontWeight: 600 }} />
          <Line type="monotone" dataKey="kwh" stroke="#ff8a3d" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={230}>
      <BarChart data={points} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff8a3d" />
            <stop offset="100%" stopColor="#ffb877" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f6" />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={range === 'month' ? 2 : 0} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
        <Tooltip formatter={(v) => [`${v} kWh`, 'Used']} labelStyle={{ fontWeight: 600 }} />
        <Bar dataKey="kwh" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
