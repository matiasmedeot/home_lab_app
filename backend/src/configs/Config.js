// src/configs/Config.js
export const config = {
  port: process.env.PORT || 5000,
  dataDir: process.env.DATA_DIR || '/data',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  },
  cache: {
    enabled: process.env.REDIS_ENABLED !== 'false',
    redisUrl: process.env.REDIS_URL || 'redis://redis:6379',
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10), // 1 hora por defecto
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'homelab'
  }
};