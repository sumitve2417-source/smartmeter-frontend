import { useState } from 'react'
import SectionTabs from '../../components/SectionTabs.jsx'
import SecuritySettings from '../../components/SecuritySettings.jsx'
import CustomerCare from '../../components/CustomerCare.jsx'

const TABS = [
  { key: 'security', label: 'Security' },
  { key: 'care', label: 'Customer Care' }
]

export default function TenantSettings() {
  const [tab, setTab] = useState('security')
  return (
    <div className="space-y-5">
      <SectionTabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === 'security' ? <SecuritySettings /> : <CustomerCare endpoint="/tenant/support" />}
    </div>
  )
}
