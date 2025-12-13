import type { Request, Response, NextFunction } from 'express'
import { prisma } from '@/config/prisma'

export type CachedTenant = {
  tenantId: string
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED'
  slug: string
  expiresAt: number
}

const cache = new Map<string, CachedTenant>()
const TTL_MS = 10 * 60 * 1000

export function normalizeHost(host?: string | null) {
  if (!host) return ''
  const h = host.toLowerCase()
  const withoutPort = h.split(':')[0]
  return withoutPort.startsWith('www.') ? withoutPort.slice(4) : withoutPort
}

export async function resolveTenantByHost(host: string) {
  const now = Date.now()
  const cached = cache.get(host)
  if (cached && cached.expiresAt > now) return cached

  const parts = host.split('.')
  const apex = parts.length >= 3 ? parts.slice(-2).join('.') : host
  const domain = await prisma.domain.findFirst({
    where: { OR: [{ domain: host }, { domain: apex }] },
    include: { tenant: true },
  })
  if (!domain || !domain.tenant) return null
  const entry: CachedTenant = {
    tenantId: domain.tenantId,
    status: domain.tenant.status,
    slug: domain.tenant.slug,
    expiresAt: now + TTL_MS,
  }
  cache.set(host, entry)
  return entry
}

async function resolveTenantById(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } })
  if (!tenant) return null
  return {
    tenantId: tenant.id,
    status: tenant.status,
    slug: tenant.slug,
    expiresAt: Date.now() + TTL_MS,
  } as CachedTenant
}

export async function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  const xTenantId = req.header('x-tenant-id')
  const rawHost = req.header('x-forwarded-host') || req.header('host') || ''
  const host = normalizeHost(rawHost)
  req.normalizedHost = host

  try {
    let resolved: CachedTenant | null = null
    if (xTenantId) {
      resolved = await resolveTenantById(xTenantId)
      if (!resolved) {
        return res.status(400).json({ error: 'invalid_tenant_id' })
      }
    } else {
      if (host) {
        resolved = await resolveTenantByHost(host)
      }
      if (!resolved) {
        const originHeader = req.header('origin') || ''
        if (originHeader) {
          try {
            const u = new URL(originHeader)
            const originHost = normalizeHost(u.host)
            if (originHost) resolved = await resolveTenantByHost(originHost)
          } catch {}
        }
      }
      if (!resolved) {
        const refererHeader = req.header('referer') || ''
        if (refererHeader) {
          try {
            const u = new URL(refererHeader)
            const refererHost = normalizeHost(u.host)
            if (refererHost) resolved = await resolveTenantByHost(refererHost)
          } catch {}
        }
      }
      if (!resolved) {
        const fallbackSlug = (process.env.DEFAULT_TENANT_SLUG || '').trim().toLowerCase()
        const fallbackId = (process.env.DEFAULT_TENANT_ID || '').trim()
        if (fallbackId) {
          resolved = await resolveTenantById(fallbackId)
        } else if (fallbackSlug) {
          const t = await prisma.tenant.findUnique({ where: { slug: fallbackSlug } })
          if (t) {
            resolved = { tenantId: t.id, status: t.status, slug: t.slug, expiresAt: Date.now() + 10 * 60 * 1000 }
          }
        }
      }
      if (!resolved) {
        return res.status(404).json({ error: 'tenant_not_found' })
      }
    }

    if (resolved.status !== 'ACTIVE') {
      return res.status(423).json({ error: 'tenant_inactive' })
    }

    req.tenantId = resolved.tenantId
    next()
  } catch (err) {
    return res.status(500).json({ error: 'tenant_resolution_failed' })
  }
}
