import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addDomain, deleteDomain, listDomains } from '../api/domains'
import { useState } from 'react'

export default function DomainsPanel({ tenantId }: { tenantId: string }) {
  const qc = useQueryClient()
  const [domain, setDomain] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['domains', tenantId],
    queryFn: async () => {
      const res = await listDomains(tenantId)
      return res.domains
    }
  })

  const create = useMutation({
    mutationFn: async () => {
      const normalized = normalize(domain)
      if (!normalized) throw new Error('domain_invalido')
      return addDomain(tenantId, normalized)
    },
    onSuccess: async () => {
      setDomain('')
      await qc.invalidateQueries({ queryKey: ['domains', tenantId] })
    }
  })

  const del = useMutation({
    mutationFn: async (id: string) => deleteDomain(id),
    onSuccess: async () => qc.invalidateQueries({ queryKey: ['domains', tenantId] })
  })

  return (
    <div className="card">
      <div className="grid cols-2">
        <div>
          <label>Nuevo dominio</label>
          <input className="input" value={domain} onChange={e => setDomain(e.target.value)} placeholder="cinnamon-makeup.com" />
        </div>
        <div className="row" style={{ alignItems: 'end' }}>
          <button className="btn primary" onClick={() => create.mutate()} disabled={create.isPending}>Agregar</button>
        </div>
      </div>
      <h4>Dominios</h4>
      {isLoading && <p className="muted">Cargando...</p>}
      <table className="table">
        <thead><tr><th>Dominio</th><th>Acciones</th></tr></thead>
        <tbody>
          {(data || []).map(d => (
            <tr key={d.id}>
              <td>{d.domain}</td>
              <td><button className="btn danger" onClick={() => { if (confirm('¿Eliminar dominio?')) del.mutate(d.id) }}>Eliminar</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function normalize(h: string) {
  const host = h.trim().toLowerCase().split(':')[0]
  return host.startsWith('www.') ? host.slice(4) : host
}
