export const config = {
    port: process.env.PORT || 5000,
    dataDir: process.env.DATA_DIR || '/data',
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  };