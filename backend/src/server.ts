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
