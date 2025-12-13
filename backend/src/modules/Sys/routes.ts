import { Router } from 'express'
import { prisma } from '@/config/prisma'
import { requireAdminToken } from '@/middlewares/sysAuth'
import { normalizeHost } from '@/middlewares/tenant.middleware'
import { IntegrationType } from '@prisma/client'

const router = Router()

router.use(requireAdminToken)

router.get('/tenants', async (_req, res) => {
  const tenants = await prisma.tenant.findMany({
    orderBy: { created_at: 'desc' },
    include: { domains: true }
  })
  res.json({ ok: true, tenants: tenants.map(t => ({ ...t, domainsCount: t.domains.length })) })
})

router.get('/tenants/:id', async (req, res) => {
  const { id } = req.params
  const tenant = await prisma.tenant.findUnique({ where: { id } })
  if (!tenant) return res.status(404).json({ ok: false, error: 'tenant_not_found' })
  res.json({ ok: true, tenant })
})

router.post('/tenants', async (req, res) => {
  const { slug, status, plan } = req.body as { slug?: string; status?: any; plan?: any }
  const s = (slug || '').trim().toLowerCase()
  if (!s) return res.status(400).json({ ok: false, error: 'invalid_slug' })
  const exists = await prisma.tenant.findUnique({ where: { slug: s } })
  if (exists) return res.status(409).json({ ok: false, error: 'slug_taken' })
  const tenant = await prisma.tenant.create({ data: { slug: s, status: status || 'ACTIVE', plan: plan || 'BASIC' } })
  res.status(201).json({ ok: true, tenant })
})

router.patch('/tenants/:id', async (req, res) => {
  const { id } = req.params
  const data: any = {}
  if (typeof req.body.slug === 'string') data.slug = req.body.slug.trim().toLowerCase()
  if (typeof req.body.status === 'string') data.status = req.body.status
  if (typeof req.body.plan === 'string') data.plan = req.body.plan
  const tenant = await prisma.tenant.update({ where: { id }, data })
  res.json({ ok: true, tenant })
})

router.delete('/tenants/:id', async (req, res) => {
  const { id } = req.params
  await prisma.domain.deleteMany({ where: { tenantId: id } })
  await prisma.integration.deleteMany({ where: { tenantId: id } })
  await prisma.tenant.delete({ where: { id } })
  res.json({ ok: true })
})

router.get('/tenants/:id/domains', async (req, res) => {
  const { id } = req.params
  const domains = await prisma.domain.findMany({ where: { tenantId: id }, orderBy: { domain: 'asc' } })
  res.json({ ok: true, domains })
})

router.post('/tenants/:id/domains', async (req, res) => {
  const { id } = req.params
  const raw = (req.body?.domain as string || '').trim().toLowerCase()
  const domain = normalizeHost(raw)
  if (!domain) return res.status(400).json({ ok: false, error: 'invalid_domain' })
  const exists = await prisma.domain.findUnique({ where: { domain } })
  if (exists) return res.status(409).json({ ok: false, error: 'domain_taken' })
  const created = await prisma.domain.create({ data: { domain, tenant: { connect: { id } } } })
  res.status(201).json({ ok: true, domain: created })
})

router.delete('/domains/:id', async (req, res) => {
  const { id } = req.params
  await prisma.domain.delete({ where: { id } })
  res.json({ ok: true })
})

router.get('/tenants/:id/integrations', async (req, res) => {
  const { id } = req.params
  const integrations = await prisma.integration.findMany({ where: { tenantId: id }, orderBy: { type: 'asc' } })
  res.json({ ok: true, integrations })
})

router.patch('/tenants/:id/integrations', async (req, res) => {
  const { id } = req.params
  const { type, name, secret } = req.body as { type: IntegrationType; name?: string; secret?: string }
  if (!type) return res.status(400).json({ ok: false, error: 'missing_type' })
  const payload = { name: name || '', secret: secret || '' }
  await prisma.integration.upsert({
    where: { tenantId_type: { tenantId: id, type } },
    update: payload,
    create: { ...payload, type, tenant: { connect: { id } } }
  })
  res.json({ ok: true })
})

export default router
