import { api } from './client'

export type Tenant = {
  id: string
  slug: string
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED'
  plan: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE'
  created_at: string
  domainsCount?: number
}

export async function listTenants(): Promise<{ ok: boolean; tenants: Tenant[] }> {
  return api.get('/sys/tenants')
}

export async function getTenant(id: string): Promise<{ ok: boolean; tenant: Tenant }> {
  return api.get(`/sys/tenants/${id}`)
}

export async function createTenant(input: { slug: string; status: Tenant['status']; plan: Tenant['plan'] }): Promise<{ ok: boolean; tenant: Tenant }> {
  return api.post('/sys/tenants', input)
}

export async function updateTenant(id: string, input: Partial<{ slug: string; status: Tenant['status']; plan: Tenant['plan'] }>): Promise<{ ok: boolean; tenant: Tenant }> {
  return api.patch(`/sys/tenants/${id}`, input)
}

export async function deleteTenant(id: string): Promise<{ ok: boolean }> {
  return api.del(`/sys/tenants/${id}`)
}
