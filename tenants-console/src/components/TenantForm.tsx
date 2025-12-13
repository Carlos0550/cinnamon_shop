import { useMutation } from '@tanstack/react-query'
import { createTenant } from '../api/tenants'
import { useState } from 'react'

type Props = {
  onClose: () => void
  onSaved: () => void
}

export default function TenantForm({ onClose, onSaved }: Props) {
  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'CANCELLED'>('ACTIVE')
  const [plan, setPlan] = useState<'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE'>('BASIC')

  const create = useMutation({
    mutationFn: async () => {
      if (!slug.trim()) throw new Error('slug_requerido')
      return createTenant({ slug: slug.trim().toLowerCase(), status, plan })
    },
    onSuccess: () => { onSaved(); onClose() }
  })

  return (
    <form className="grid cols-2" onSubmit={(e) => { e.preventDefault(); create.mutate(); }}>
      <div>
        <label>Slug</label>
        <input className="input" value={slug} onChange={e => setSlug(e.target.value)} placeholder="cinnamon-makeup" />
      </div>
      <div>
        <label>Status</label>
        <select className="select" value={status} onChange={e => setStatus(e.target.value as any)}>
          <option value="ACTIVE">ACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>
      <div>
        <label>Plan</label>
        <select className="select" value={plan} onChange={e => setPlan(e.target.value as any)}>
          <option value="FREE">FREE</option>
          <option value="BASIC">BASIC</option>
          <option value="PRO">PRO</option>
          <option value="ENTERPRISE">ENTERPRISE</option>
        </select>
      </div>
      <div className="row" style={{ alignItems: 'end', justifyContent: 'end' }}>
        <button type="button" className="btn" onClick={onClose}>Cancelar</button>
        <button type="submit" className="btn primary" disabled={create.isPending}>Guardar</button>
      </div>
      {create.isError && <p className="muted">Error al crear</p>}
    </form>
  )
}
