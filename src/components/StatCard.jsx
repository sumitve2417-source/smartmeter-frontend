export default function StatCard({ label, value, sub, tone = 'default', icon }) {
  const tones = {
    default: 'bg-white',
    orange: 'bg-orange-50',
    blue: 'bg-blue-50'
  }
  return (
    <div className={`card ${tones[tone]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-xl font-bold text-slate-800 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
    </div>
  )
}
