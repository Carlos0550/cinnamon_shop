import { api } from './client'

export type Domain = {
  id: string
  domain: string
  tenantId: string
}

export async function listDomains(tenantId: string): Promise<{ ok: boolean; domains: Domain[] }> {
  return api.get(`/sys/tenants/${tenantId}/domains`)
}

export async function addDomain(tenantId: string, domain: string): Promise<{ ok: boolean; domain: Domain }> {
  return api.post(`/sys/tenants/${tenantId}/domains`, { domain })
}

export async function deleteDomain(id: string): Promise<{ ok: boolean }> {
  return api.del(`/sys/domains/${id}`)
}
