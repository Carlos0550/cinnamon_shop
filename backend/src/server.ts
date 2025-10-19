import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from '@/config/prisma';
import { pingRedis } from '@/config/redis';
import UserRouter from '@/modules/User/routes';
import ProductRouter from '@/modules/Products/routes';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
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
app.use("/api", ProductRouter)

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});