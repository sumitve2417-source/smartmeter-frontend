import { Outlet } from 'react-router-dom'
import BottomNav from '../../components/BottomNav.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const TABS = [
  { to: '/landlord/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/landlord/rooms', label: 'Rooms', icon: '🏠' },
  { to: '/landlord/recharges', label: 'Recharges', icon: '💳' },
  { to: '/landlord/settings', label: 'Settings', icon: '⚙️' }
]

export default function LandlordLayout() {
  const { auth, logout } = useAuth()
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="text-xs text-slate-400">Landlord</p>
          <h1 className="font-bold text-slate-800">{auth?.name}</h1>
        </div>
        <button onClick={logout} className="text-sm text-slate-400 hover:text-red-500">Logout</button>
      </header>
      <main className="px-5 py-5 max-w-2xl mx-auto">
        <Outlet />
      </main>
      <BottomNav items={TABS} />
    </div>
  )
}
