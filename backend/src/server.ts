import 'dotenv/config';
import '@/config/dayjs';
import express from 'express';
import cors from 'cors';
import { prisma } from '@/config/prisma';
import { pingRedis } from '@/config/redis';
import UserRouter from '@/modules/User/routes';
import ProductRouter from '@/modules/Products/routes';
import PromoRouter from '@/modules/Promos/routes';
import SalesRouter from '@/modules/Sales/routes';
import CartRouter from '@/modules/Cart/routes';
import OrdersRouter from '@/modules/Orders/routes';
import { initUploadsCleanupJob } from './jobs/cleanupUploads';
import swaggerUi from 'swagger-ui-express';
import spec from './docs/openapi';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(cors());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: {
    write: (msg) => console.log(msg.trim()),
  },
}));


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

app.use('/api', UserRouter);
app.use("/api/products", ProductRouter)
app.use("/api/promos", PromoRouter)
app.use("/api/sales", SalesRouter)
app.use("/api/cart", CartRouter)
app.use("/api/orders", OrdersRouter)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
app.get('/docs.json', (_req, res) => res.json(spec));

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  initUploadsCleanupJob();
});
