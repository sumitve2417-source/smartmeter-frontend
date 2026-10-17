import { Outlet } from 'react-router-dom'
import BottomNav from '../../components/BottomNav.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const TABS = [
  { to: '/tenant/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/tenant/wallet', label: 'Wallet', icon: '👛' },
  { to: '/tenant/bill', label: 'Bill', icon: '🧾' },
  { to: '/tenant/settings', label: 'Settings', icon: '⚙️' }
]

export default function TenantLayout() {
  const { auth, logout } = useAuth()
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="text-xs text-slate-400">Welcome</p>
          <h1 className="font-bold text-slate-800">{auth?.name}</h1>
        </div>
        <button onClick={logout} className="text-sm text-slate-400 hover:text-red-500">Logout</button>
      </header>
      <main className="px-5 py-5 max-w-lg mx-auto">
        <Outlet />
      </main>
      <BottomNav items={TABS} />
    </div>
  )
}
