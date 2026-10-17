const RANGES = [
  { key: 'day', label: 'Day' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' }
]

export default function RangeTabs({ value, onChange }) {
  return (
    <div className="inline-flex bg-slate-100 rounded-full p-1">
      {RANGES.map((r) => (
        <button key={r.key} onClick={() => onChange(r.key)}
          className={`pill ${value === r.key ? 'pill-active' : 'pill-inactive'}`}>
          {r.label}
        </button>
      ))}
    </div>
  )
}
