import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getIntegrations, upsertIntegration, Integration } from '../api/integrations'
import { useState } from 'react'

function IntegrationCard({ tenantId, type, title }: { tenantId: string; type: 'AUTHENTICATION' | 'MODELLM'; title: string }) {
  const qc = useQueryClient()
  const { data } = useQuery({
    queryKey: ['integrations', tenantId],
    queryFn: async () => {
      const res = await getIntegrations(tenantId)
      return res.integrations
    }
  })
  const current = (data || []).find(i => i.type === type)
  const [name, setName] = useState(current?.name || '')
  const [secret, setSecret] = useState(current?.secret || '')
  const [show, setShow] = useState(false)

  const save = useMutation({
    mutationFn: async () => {
      const payload: Integration = { type, name, secret }
      return upsertIntegration(tenantId, payload)
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['integrations', tenantId] })
    }
  })
  return (
    <div className="card">
      <h4 style={{ marginTop: 0 }}>{title}</h4>
      <div className="grid cols-2">
        <div>
          <label>Nombre</label>
          <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder={type === 'AUTHENTICATION' ? 'Clerk' : 'OpenAI'} />
        </div>
        <div>
          <label>Secret</label>
          <div className="row">
            <input className="input" type={show ? 'text' : 'password'} value={secret} onChange={e => setSecret(e.target.value)} placeholder="••••••••" />
            <button className="btn" onClick={() => setShow(s => !s)}>{show ? 'Ocultar' : 'Mostrar'}</button>
          </div>
        </div>
        <div className="row" style={{ alignItems: 'end' }}>
          <button className="btn primary" disabled={save.isPending} onClick={() => save.mutate()}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

export default function IntegrationsPanel({ tenantId }: { tenantId: string }) {
  return (
    <div>
      <IntegrationCard tenantId={tenantId} type="AUTHENTICATION" title="Autenticación (Clerk)" />
      <IntegrationCard tenantId={tenantId} type="MODELLM" title="Model LLM (OpenAI)" />
    </div>
  )
}
