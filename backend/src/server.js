import express from 'express';
import cors from 'cors';
import { config } from './configs/Config.js';
import { Database } from './infrastructure/database/database.js';
import { ServiceRepository } from './infrastructure/repositories/ServiceRepository.js';
import { ServiceUseCases } from './application/usecases/ServiceUseCases.js';
import { ServiceController } from './controllers/ServiceController.js';
import { setupServiceRoutes } from './routes/ServiceRoutes.js';
import { getLogger } from  './infrastructure/utils/logger.js';
import { CacheMiddleware } from "./infrastructure/cache/CacheMiddleware.js";
import container from "./infrastructure/container/dependency_container.js";

async function startServer(options = {}) {
  try {
    const app = express();

    // Inicializar el contenedor de dependencias
    await container.initialize();

    // Middleware
    app.use(cors(config.cors));
    app.use(express.json());
    
    const logger = getLogger('homelab_api');

    // Endpoint de verificación de salud
    app.get('/health', (req, res) => {
      logger.info('Operación iniciada', { 'operation': 'miFuncion' });
      res.status(200).json({ status: 'UP' });
    });
    
    // Endpoint de preparación
    app.get('/ready', async (req, res) => {
      try {
        // Verifica la conexión a la base de datos
        await options.database.sequelize.authenticate();
        res.status(200).json({ status: 'READY' });
      } catch (error) {
        res.status(503).json({ status: 'NOT_READY', message: error.message });
      }
    });
    

    // Obtener las dependencias del contenedor
    const database = container.database;
    const cacheService = container.cacheService;

    // Inicializar middleware de caché
    const cacheMiddleware = new CacheMiddleware(cacheService);

    // Configuración de repositorios, casos de uso y controladores
    const serviceRepository = new ServiceRepository(database);
    const serviceUseCases = new ServiceUseCases(serviceRepository);
    const serviceController = new ServiceController(serviceUseCases);

    // Rutas
    app.use(
      "/api/services",
      setupServiceRoutes(serviceController, cacheMiddleware)
    );

    // Ruta de estado para verificar la conexión a Redis
    app.get("/api/status", (req, res) => {
      res.json({
        status: "online",
        redis: cacheService.isConnected ? "connected" : "disconnected",
        time: new Date().toISOString(),
      });
    });

    // Manejo global de errores
    app.use((err, req, res, next) => {
      console.error("Error no manejado:", err);
      res.status(500).json({ message: "Error interno del servidor" });
    });

    // Iniciar servidor (solo si no es un test)
    if (!options.isTest) {
      app.listen(config.port, () => {
        console.log(`Servidor corriendo en puerto ${config.port}`);
      });
    }

    // Agregar el servicio de caché al objeto app para poder cerrarlo apropiadamente
    app.container = container;

    return app;
  } catch (error) {
    console.error("Error iniciando el servidor:", error);
    if (!options.isTest) {
      process.exit(1);
    }
    throw error;
  }
}

// Manejo de señales para cerrar conexiones
process.on("SIGINT", async () => {
  console.log("Cerrando aplicación...");
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
  main().catch((err) => {
    console.error("Error fatal en aplicación:", err);
    process.exit(1);
  });
}

export default startServer;
