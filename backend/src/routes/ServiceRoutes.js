// src/routes/ServiceRoutes.js
import express from 'express';

export function setupServiceRoutes(serviceController, cacheMiddleware) {
  const router = express.Router();
  
  // Prefijo de caché para servicios
  const CACHE_PREFIX = 'services';
  
  // Rutas GET con caché
  router.get('/', 
    cacheMiddleware.cache(CACHE_PREFIX), 
    serviceController.getAll.bind(serviceController)
  );
  
  router.get('/:id', 
    cacheMiddleware.cache(CACHE_PREFIX, req => `id:${req.params.id}`), 
    serviceController.getById.bind(serviceController)
  );
  
  // Rutas de modificación con invalidación de caché
  router.post('/', 
    cacheMiddleware.invalidateCache(`${CACHE_PREFIX}:*`), 
    serviceController.create.bind(serviceController)
  );
  
  router.put('/:id', 
    cacheMiddleware.invalidateCache(`${CACHE_PREFIX}:*`), 
    serviceController.update.bind(serviceController)
  );
  
  router.delete('/:id', 
    cacheMiddleware.invalidateCache(`${CACHE_PREFIX}:*`), 
    serviceController.delete.bind(serviceController)
  );

  return router;
}