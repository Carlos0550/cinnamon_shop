import 'dotenv/config';
import { exec } from 'child_process';
import '@/config/dayjs';
import express from 'express';
import cors from 'cors';
import { prisma } from '@/config/prisma';
import { pingRedis } from '@/config/redis';
import UserRouter from '@/modules/User/routes';
import AdminAuthRouter from '@/modules/AuthAdmin/routes';
import ShopAuthRouter from '@/modules/AuthShop/routes';
import ProductRouter from '@/modules/Products/routes';
import PromoRouter from '@/modules/Promos/routes';
import SalesRouter from '@/modules/Sales/routes';
import CartRouter from '@/modules/Cart/routes';
import OrdersRouter from '@/modules/Orders/routes';
import ProfileRouter from '@/modules/Profile/routes';
import BusinessRouter from '@/modules/Business/router';
import FaqRouter from '@/modules/FAQ/routes';
import PaletteRouter from '@/modules/Palettes/routes';
import { initUploadsCleanupJob } from './jobs/cleanupUploads';
import swaggerUi from 'swagger-ui-express';
import spec from './docs/openapi';
import morgan from 'morgan';
import { initProductsCacheSyncJob } from './jobs/productsCacheSync';
import { tenantMiddleware } from '@/middlewares/tenant.middleware';
import { normalizeHost, resolveTenantByHost } from '@/middlewares/tenant.middleware';
import { IntegrationType } from '@prisma/client';
import SysRouter from '@/modules/Sys/routes';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(cors());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: {
    write: (msg) => console.log(msg.trim()),
  },
}));

// Sys admin routes (no tenant resolution)
app.use('/api/sys', SysRouter);

app.use(tenantMiddleware);

app.get('/api/tenant/resolve', async (req, res) => {
  const rawHost = req.header('x-forwarded-host') || req.header('host') || ''
  const host = normalizeHost(rawHost)
  const resolved = host ? await resolveTenantByHost(host) : null
  if (!resolved) return res.status(404).json({ ok: false, error: 'tenant_not_found' })
  if (resolved.status !== 'ACTIVE') return res.status(423).json({ ok: false, error: 'tenant_inactive' })
  return res.json({ ok: true, tenantId: resolved.tenantId, slug: resolved.slug })
});

app.get('/api/integrations', async (req, res) => {
  const tenantId = req.tenantId
  if (!tenantId) return res.status(401).json({ ok: false, error: 'tenant_required' })
  const items = await prisma.integration.findMany({ where: { tenantId }, select: { type: true, name: true } })
  const types = items.map(i => i.type)
  const hasAuth = types.includes(IntegrationType.AUTHENTICATION)
  const hasModel = types.includes(IntegrationType.MODELLM)
  res.json({ ok: true, types, hasAuth, hasModel })
})

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$connect();
    const pong = await pingRedis();
    res.json({ ok: true, db: 'connected', redis: pong === 'PONG' ? 'connected' : 'unknown' });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'health_check_failed' });
  } finally {
    await prisma.$disconnect();
  }
});

app.use('/api/admin', AdminAuthRouter);
app.use('/api/shop', ShopAuthRouter);
app.use('/api', UserRouter);
app.use('/api', ProfileRouter);
app.use('/api/faqs', FaqRouter);
app.use("/api/products", ProductRouter)
app.use("/api/promos", PromoRouter)
app.use("/api/sales", SalesRouter)
app.use("/api/cart", CartRouter)
app.use("/api/orders", OrdersRouter)
app.use("/api/business", BusinessRouter)
app.use("/api", PaletteRouter)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
app.get('/docs.json', (_req, res) => res.json(spec));

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  
  if(process.env.NODE_ENV === "production"){
    exec('npx prisma migrate deploy', (error, stdout, stderr) => {
      if (error) {
        console.error(`Migration error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`Migration info: ${stderr}`);
      }
      console.log(`Migration result: ${stdout}`);
    });
  }

  initUploadsCleanupJob();
  initProductsCacheSyncJob();
});
