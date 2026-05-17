import Redis from 'ioredis';

const getRedisClient = () => {
  if (!process.env.REDIS_URL) return null;
  return new Redis(process.env.REDIS_URL, {
    tls: {},              // wajib untuk Upstash (rediss://)
    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
  });
};

export const redis = getRedisClient();