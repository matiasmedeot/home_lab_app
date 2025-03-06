import express from 'express';
import cors from 'cors';
import { config } from './configs/Config.js';
import { Database } from './infrastructure/database/database.js';
import { ServiceRepository } from './infrastructure/repositories/ServiceRepository.js';
import { ServiceUseCases } from './application/usecases/ServiceUseCases.js';
import { ServiceController } from './controllers/ServiceController.js';
import { setupServiceRoutes } from './routes/ServiceRoutes.js';

async function startServer() {
  try {
    const app = express();
    
    // Middleware
    app.use(cors(config.cors));
    app.use(express.json());
    
    // Configuración de dependencias
    const database = new Database(config.dataDir);
    await database.connect();
    
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
    
    // Iniciar servidor
    app.listen(config.port, () => {
      console.log(`Servidor corriendo en puerto ${config.port}`);
    });
    
    return app;
  } catch (error) {
    console.error('Error iniciando el servidor:', error);
    process.exit(1);
  }
}

export default startServer;