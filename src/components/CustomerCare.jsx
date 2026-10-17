import { useEffect, useState } from 'react'
import client from '../api/client'

function ContactCard({ title, name, email, phone, icon }) {
  if (!email && !phone) return null
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h2 className="font-semibold text-slate-800">{title}</h2>
      </div>
      {name && <p className="text-slate-700 font-medium mb-2">{name}</p>}
      <div className="space-y-2">
        {phone && (
          <a href={`tel:${phone}`} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
            <span className="text-slate-500">Phone</span>
            <span className="font-medium text-brand-700">{phone}</span>
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
            <span className="text-slate-500">Email</span>
            <span className="font-medium text-brand-700 truncate ml-3">{email}</span>
          </a>
        )}
      </div>
    </div>
  )
}

/** endpoint = '/tenant/support' or '/landlord/support'. Tenants see their landlord + the app's support; landlords see just the app's support. */
export default function CustomerCare({ endpoint }) {
  const [info, setInfo] = useState(null)

  useEffect(() => { client.get(endpoint).then((r) => setInfo(r.data)) }, [endpoint])
  if (!info) return <p className="text-slate-400 text-sm">Loading...</p>

  return (
    <div className="space-y-5">
      {info.landlordEmail || info.landlordPhone ? (
        <ContactCard title="Your Landlord" name={info.landlordName} email={info.landlordEmail} phone={info.landlordPhone} icon="🏠" />
      ) : null}
      <ContactCard title="App Support" name={info.productMakerName} email={info.productMakerEmail} phone={info.productMakerPhone} icon="🛠️" />
    </div>
  )
}
