import { api } from './client'

export type IntegrationType = 'AUTHENTICATION' | 'MODELLM'

export type Integration = {
  type: IntegrationType
  name: string
  secret?: string
}

export async function getIntegrations(tenantId: string): Promise<{ ok: boolean; integrations: Integration[] }> {
  return api.get(`/sys/tenants/${tenantId}/integrations`)
}

export async function upsertIntegration(tenantId: string, input: Integration): Promise<{ ok: boolean }> {
  return api.patch(`/sys/tenants/${tenantId}/integrations`, input)
}
