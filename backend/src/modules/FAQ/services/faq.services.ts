import { prisma } from '@/config/prisma';
import { withTenantCreateData } from '@/config/tenantScope';

export default class FaqServices {
  async listPublic(tenantId: string) {
    const items = await prisma.fAQ.findMany({
      where: { is_active: true, deleted_at: null, tenantId },
      orderBy: [{ position: 'asc' }, { created_at: 'desc' }],
    });
    return { ok: true, items };
  }

  async listAdmin(tenantId: string, page: number = 1, limit: number = 50) {
    const skip = (Math.max(1, page) - 1) * Math.max(1, limit);
    const [items, total] = await Promise.all([
      prisma.fAQ.findMany({
        where: { tenantId },
        orderBy: [{ position: 'asc' }, { created_at: 'desc' }],
        skip,
        take: Math.max(1, limit),
      }),
      prisma.fAQ.count({ where: { tenantId } }),
    ]);
    return { ok: true, items, page, total };
  }

  async create(tenantId: string, data: { question: string; answer: string; position?: number; is_active?: boolean }) {
    const item = await prisma.fAQ.create({ data: withTenantCreateData(data, tenantId) });
    return { ok: true, item };
  }

  async update(tenantId: string, id: string, data: Partial<{ question: string; answer: string; position: number; is_active: boolean }>) {
    const item = await prisma.fAQ.update({ where: { id, tenantId }, data });
    return { ok: true, item };
  }

  async softDelete(tenantId: string, id: string) {
    await prisma.fAQ.delete({ where: { id, tenantId } });
    return { ok: true };
  }
}
