import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTenant, Tenant } from '../api/tenants'
import DomainsPanel from '../sections/DomainsPanel'
import IntegrationsPanel from '../sections/IntegrationsPanel'
import { useState } from 'react'

export default function TenantDetail() {
  const { id = '' } = useParams()
  const [tab, setTab] = useState<'domains' | 'integrations'>('domains')
  const { data, isLoading } = useQuery({
    queryKey: ['tenant', id],
    queryFn: async () => {
      const res = await getTenant(id)
      return res.tenant as Tenant
    }
  })
  return (
    <div>
      <div className="card">
        {isLoading && <p className="muted">Cargando...</p>}
        {data && (
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: 0 }}>{data.slug}</h3>
              <p className="muted">{data.status} • {data.plan}</p>
            </div>
          </div>
        )}
      </div>
      <div className="tabs">
        <div className={`tab ${tab === 'domains' ? 'active' : ''}`} onClick={() => setTab('domains')}>Domains</div>
        <div className={`tab ${tab === 'integrations' ? 'active' : ''}`} onClick={() => setTab('integrations')}>Integrations</div>
      </div>
      {tab === 'domains' && <DomainsPanel tenantId={id} />}
      {tab === 'integrations' && <IntegrationsPanel tenantId={id} />}
    </div>
  )
}
