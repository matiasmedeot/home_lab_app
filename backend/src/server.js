import express from 'express';
import cors from 'cors';
import { config } from './configs/Config.js';
import { Database } from './infrastructure/database/database.js';
import { ServiceRepository } from './infrastructure/repositories/ServiceRepository.js';
import { ServiceUseCases } from './application/usecases/ServiceUseCases.js';
import { ServiceController } from './controllers/ServiceController.js';
import { setupServiceRoutes } from './routes/ServiceRoutes.js';
import { getLogger } from  './infrastructure/utils/logger.js';

async function startServer(options = {}) {
  try {
    const app = express();
    
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
    

    // Configuración de dependencias
    const database = options.database || new Database(config.dataDir);
    
    if (!options.database) {
      await database.connect();
    }
    
    const serviceRepository = new ServiceRepository(database);
    const serviceUseCases = new ServiceUseCases(serviceRepository);
    const serviceController = new ServiceController(serviceUseCases);
    
    // Rutas
    app.use('/api/services', setupServiceRoutes(serviceController));
    
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
    
    return app;
  } catch (error) {
    console.error('Error iniciando el servidor:', error);
    if (!options.isTest) {
      process.exit(1);
    }
    throw error;
  }
}

export default startServer;