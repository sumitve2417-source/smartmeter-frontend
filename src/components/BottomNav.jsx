import { NavLink } from 'react-router-dom'

export default function BottomNav({ items }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex px-2 pb-[env(safe-area-inset-bottom)] z-20">
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}>
          <span className="text-xl leading-none">{it.icon}</span>
          <span>{it.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
