import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { createTenant, listTenants, Tenant, deleteTenant } from '../api/tenants'
import TenantForm from '../components/TenantForm'
import { useState } from 'react'

export default function TenantsList() {
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const res = await listTenants()
      return res.tenants as Tenant[]
    }
  })

  const del = useMutation({
    mutationFn: async (id: string) => {
      return deleteTenant(id)
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['tenants'] })
    }
  })

  return (
    <div>
      <div className="toolbar">
        <button className="btn primary" onClick={() => setShowCreate(true)}>Nuevo Tenant</button>
      </div>
      {showCreate && (
        <div className="card">
          <TenantForm onClose={() => setShowCreate(false)} onSaved={() => qc.invalidateQueries({ queryKey: ['tenants'] })} />
        </div>
      )}
      <div className="card">
        <h3>Tenants</h3>
        {isLoading && <p className="muted">Cargando...</p>}
        {error && <p className="muted">Error al cargar</p>}
        <table className="table">
          <thead>
            <tr>
              <th>Slug</th>
              <th>Status</th>
              <th>Plan</th>
              <th>Dominios</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(data || []).map(t => (
              <tr key={t.id}>
                <td><Link to={`/tenants/${t.id}`}>{t.slug}</Link></td>
                <td>{t.status}</td>
                <td>{t.plan}</td>
                <td>{t.domainsCount ?? '-'}</td>
                <td className="row">
                  <Link className="btn" to={`/tenants/${t.id}`}>Abrir</Link>
                  <button className="btn danger" onClick={() => { if (confirm('¿Eliminar tenant?')) del.mutate(t.id) }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
