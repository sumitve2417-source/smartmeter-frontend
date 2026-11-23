import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Login, { homePathForRole } from './pages/Login.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import TenantLayout from './pages/tenant/TenantLayout.jsx'
import TenantDashboard from './pages/tenant/Dashboard.jsx'
import TenantWallet from './pages/tenant/Wallet.jsx'
import TenantBill from './pages/tenant/Bill.jsx'
import TenantSettings from './pages/tenant/Settings.jsx'
import LandlordLayout from './pages/landlord/LandlordLayout.jsx'
import LandlordDashboard from './pages/landlord/Dashboard.jsx'
import LandlordRooms from './pages/landlord/Rooms.jsx'
import LandlordRecharges from './pages/landlord/Recharges.jsx'
import LandlordSettings from './pages/landlord/Settings.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminLandlords from './pages/admin/Landlords.jsx'
import AdminSettings from './pages/admin/Settings.jsx'

function Protected({ role, children }) {
  const { auth } = useAuth()
  if (!auth) return <Navigate to="/login" replace />
  if (role && auth.role !== role) return <Navigate to={homePathForRole(auth.role)} replace />
  return children
}

export default function App() {
  const { auth } = useAuth()
  const homePath = auth ? homePathForRole(auth.role) : '/login'

  return (
    <Routes>
      <Route path="/login" element={auth ? <Navigate to={homePath} replace /> : <Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/admin" element={<Protected role="ADMIN"><AdminLayout /></Protected>}>
        <Route index element={<Navigate to="landlords" replace />} />
        <Route path="landlords" element={<AdminLandlords />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="/tenant" element={<Protected role="TENANT"><TenantLayout /></Protected>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<TenantDashboard />} />
        <Route path="wallet" element={<TenantWallet />} />
        <Route path="bill" element={<TenantBill />} />
        <Route path="settings" element={<TenantSettings />} />
      </Route>

      <Route path="/landlord" element={<Protected role="LANDLORD"><LandlordLayout /></Protected>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<LandlordDashboard />} />
        <Route path="rooms" element={<LandlordRooms />} />
        <Route path="recharges" element={<LandlordRecharges />} />
        <Route path="settings" element={<LandlordSettings />} />
      </Route>

      <Route path="*" element={<Navigate to={homePath} replace />} />
    </Routes>
  )
}
