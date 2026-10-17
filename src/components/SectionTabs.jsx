export default function SectionTabs({ tabs, value, onChange }) {
  return (
    <div className="flex bg-slate-100 rounded-full p-1">
      {tabs.map((t) => (
        <button key={t.key} onClick={() => onChange(t.key)}
          className={`flex-1 pill text-sm ${value === t.key ? 'pill-active' : 'pill-inactive'}`}>
          {t.label}
        </button>
      ))}
    </div>
  )
}
