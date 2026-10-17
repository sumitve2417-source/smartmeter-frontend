import { useState } from 'react'
import SectionTabs from '../../components/SectionTabs.jsx'
import PaymentsSettings from '../../components/PaymentsSettings.jsx'
import SecuritySettings from '../../components/SecuritySettings.jsx'
import CustomerCare from '../../components/CustomerCare.jsx'

const TABS = [
  { key: 'payments', label: 'Payments' },
  { key: 'security', label: 'Security' },
  { key: 'care', label: 'Customer Care' }
]

export default function LandlordSettings() {
  const [tab, setTab] = useState('payments')
  return (
    <div className="space-y-5">
      <SectionTabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === 'payments' && <PaymentsSettings />}
      {tab === 'security' && <SecuritySettings />}
      {tab === 'care' && <CustomerCare endpoint="/landlord/support" />}
    </div>
  )
}
