import { Router } from 'express';
import { requireAuth, requireRole } from '@/middlewares/auth.middleware';
import FaqServices from './services/faq.services';
import { ensureFaqCreate, ensureFaqUpdate, parseFaqListQuery } from './router.controller';
import { getTenantId } from '@/config/tenantScope';

const router = Router();
const service = new FaqServices();

// Público
router.get('/', async (req, res) => {
  const tenantId = getTenantId(req);
  const rs = await service.listPublic(tenantId);
  res.json(rs);
});

// Admin
router.get('/admin', requireAuth, requireRole([1]), parseFaqListQuery, async (req, res) => {
  const { page, limit } = (req as any).faqQuery as { page: number; limit: number };
  const tenantId = getTenantId(req);
  const rs = await service.listAdmin(tenantId, page, limit);
  res.json(rs);
});

router.post('/', requireAuth, requireRole([1]), ensureFaqCreate, async (req, res) => {
  const data = (req as any).faqCreate;
  const tenantId = getTenantId(req);
  const rs = await service.create(tenantId, data);
  res.status(201).json(rs);
});

router.put('/:id', requireAuth, requireRole([1]), ensureFaqUpdate, async (req, res) => {
  const id = req.params.id;
  const data = (req as any).faqUpdate;
  const tenantId = getTenantId(req);
  const rs = await service.update(tenantId, id, data);
  res.json(rs);
});

router.delete('/:id', requireAuth, requireRole([1]), async (req, res) => {
  const id = req.params.id;
  const tenantId = getTenantId(req);
  const rs = await service.softDelete(tenantId, id);
  res.json(rs);
});

export default router;
