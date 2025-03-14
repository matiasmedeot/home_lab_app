// src/infrastructure/cache/CacheMiddleware.js
export class CacheMiddleware {
    constructor(cacheService) {
      this.cacheService = cacheService;
    }
  
    /**
     * Middleware para cachear respuestas
     * @param {String} keyPrefix - Prefijo para la clave de caché
     * @param {Function} getKey - Función para generar la clave de caché basada en la request
     * @param {Number} ttl - Tiempo de vida en segundos (opcional)
     */
    cache(keyPrefix, getKey = req => req.originalUrl, ttl = null) {
      return async (req, res, next) => {
        if (req.method !== 'GET') {
          return next();
        }
  
        try {
          // Generar clave de caché
          const key = `${keyPrefix}:${getKey(req)}`;
          
          // Intentar obtener datos de caché
          const cachedData = await this.cacheService.get(key);
          
          if (cachedData) {
            console.log(`Caché HIT: ${key}`);
            return res.json(cachedData);
          }
  
          console.log(`Caché MISS: ${key}`);
  
          // Almacenar la respuesta original
          const originalJson = res.json;
          
          // Sobreescribir el método json para capturar la respuesta
          res.json = (data) => {
            // Restaurar el método original
            res.json = originalJson;
            
            // Almacenar en caché
            this.cacheService.set(key, data, ttl);
            
            // Enviar respuesta al cliente
            return originalJson.call(res, data);
          };
  
          next();
        } catch (error) {
          console.error('Error en middleware de caché:', error);
          next();
        }
      };
    }
  
    /**
     * Middleware para invalidar el caché después de una modificación
     * @param {String} keyPattern - Patrón de clave a invalidar
     */
    invalidateCache(keyPattern) {
      return async (req, res, next) => {
        // Almacenar la respuesta original
        const originalJson = res.json;
        const originalStatus = res.status;
  
        // Sobreescribir status para detectar operaciones exitosas
        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
        
        // Sobreescribir el método json para invalidar después de responder
        res.json = (data) => {
          // Restaurar los métodos originales
          res.json = originalJson;
          res.status = originalStatus;
          
          // Si la operación fue exitosa (2xx), invalidar el caché
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`Invalidando caché con patrón: ${keyPattern}`);
            this.cacheService.invalidatePattern(keyPattern);
          }
          
          // Enviar respuesta al cliente
          return originalJson.call(res, data);
        };
  
        next();
      };
    }
  }