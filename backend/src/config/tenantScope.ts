import type { Request } from 'express'

export function getTenantId(req: Request) {
  if (!req.tenantId) throw new Error('tenant_missing')
  return req.tenantId
}

export function appendTenantWhere<T extends Record<string, any>>(where: T, tenantId: string) {
  return { ...where, tenantId }
}

export function withTenantCreateData<T extends Record<string, any>>(data: T, tenantId: string) {
  return { 
    ...data, 
    tenant: { connect: { id: tenantId } } 
  }
}

export function ensureTenantId<T extends Record<string, any>>(obj: T, tenantId: string) {
  return { ...obj, tenantId }
}
