import express from 'express';
import cors from 'cors';
import { config } from './configs/Config.js';
import { Database } from './infrastructure/database/database.js';
import { ServiceRepository } from './infrastructure/repositories/ServiceRepository.js';
import { ServiceUseCases } from './application/usecases/ServiceUseCases.js';
import { ServiceController } from './controllers/ServiceController.js';
import { setupServiceRoutes } from './routes/ServiceRoutes.js';
import { RedisCache } from './infrastructure/cache/RedisCache.js';
import { CacheMiddleware } from './infrastructure/cache/CacheMiddleware.js';

async function startServer(options = {}) {
  try {
    const app = express();
    
    // Middleware
    app.use(cors(config.cors));
    app.use(express.json());
    
    // Configuración de base de datos
    const database = options.database || new Database(config.dataDir);
    
    if (!options.database) {
      await database.connect();
    }
    
    // Configuración de caché
    const redisCache = new RedisCache({
      ttl: config.cache?.ttl || 3600, // 1 hora por defecto
      url: config.cache?.redisUrl || 'redis://redis:6379'
    });
    
    // Intentar conectar a Redis, pero continuar si falla
    try {
      await redisCache.connect();
    } catch (err) {
      console.warn('No se pudo conectar a Redis. La API funcionará sin caché:', err.message);
    }
    
    // Inicializar middleware de caché
    const cacheMiddleware = new CacheMiddleware(redisCache);
    
    // Configuración de repositorios, casos de uso y controladores
    const serviceRepository = new ServiceRepository(database);
    const serviceUseCases = new ServiceUseCases(serviceRepository);
    const serviceController = new ServiceController(serviceUseCases);
    
    // Rutas
    app.use('/api/services', setupServiceRoutes(serviceController, cacheMiddleware));
    
    // Ruta de estado para verificar la conexión a Redis
    app.get('/api/status', (req, res) => {
      res.json({
        status: 'online',
        redis: redisCache.isConnected ? 'connected' : 'disconnected',
        time: new Date().toISOString()
      });
    });
    
    // Manejo global de errores
    app.use((err, req, res, next) => {
      console.error('Error no manejado:', err);
      res.status(500).json({ message: 'Error interno del servidor' });
    });
    
    // Iniciar servidor (solo si no es un test)
    if (!options.isTest) {
      app.listen(config.port, () => {
        console.log(`Servidor corriendo en puerto ${config.port}`);
      });
    }
    
    // Agregar el servicio de caché al objeto app para poder cerrarlo apropiadamente
    app.redisCache = redisCache;
    
    return app;
  } catch (error) {
    console.error('Error iniciando el servidor:', error);
    if (!options.isTest) {
      process.exit(1);
    }
    throw error;
  }
}

// Manejo de señales para cerrar conexiones
process.on('SIGINT', async () => {
  console.log('Cerrando aplicación...');
  if (global.app && global.app.redisCache) {
    await global.app.redisCache.close();
  }
  process.exit(0);
});

// Para iniciar el servidor y mantener la referencia
async function main() {
  global.app = await startServer();
  return global.app;
}

// Si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error('Error fatal en aplicación:', err);
    process.exit(1);
  });
}

export default startServer;