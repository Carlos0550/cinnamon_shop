import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
});

export async function pingRedis(): Promise<string> {
  try {
    const pong = await redis.ping();
    return pong;
  } catch (err) {
    throw err as Error;
  }
}

export async function closeRedis(): Promise<void> {
  await redis.quit();
}