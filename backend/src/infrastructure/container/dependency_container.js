// src/infrastructure/container/index.js
import { Database } from '../database/database.js';
import { RedisCache } from '../cache/RedisCache.js';
import { config } from '../../configs/Config.js';

// Clase mock de RedisCache para entornos de prueba
class MockRedisCache {
  constructor() {
    this.cache = new Map();
    this.isConnected = true;
  }

  async connect() {
    return this;
  }

  async get(key) {
    return this.cache.get(key) || null;
  }

  async set(key, value, ttl) {
    this.cache.set(key, value);
    return true;
  }

  async invalidate(key) {
    this.cache.delete(key);
    return true;
  }

  async invalidatePattern(pattern) {
    // Implementación simple: elimina las claves que coinciden con el patrón (sin * para simplificar)
    for (const key of this.cache.keys()) {
      if (key.includes(pattern.replace('*', ''))) {
        this.cache.delete(key);
      }
    }
    return true;
  }

  async close() {
    this.cache.clear();
  }
}

class DependencyContainer {
  constructor() {
    this._database = null;
    this._cacheService = null;
    this._initialized = false;
  }

  async initialize() {
    if (this._initialized) return;

    const isTest = process.env.NODE_ENV === 'test';
    
    // Inicializar base de datos
    this._database = new Database(isTest ? null : config.dataDir);
    await this._database.connect();
    
    // Inicializar servicio de caché
    if (isTest) {
      // Usar mock en entorno de pruebas
      this._cacheService = new MockRedisCache();
    } else {
      // Usar Redis real en otros entornos
      this._cacheService = new RedisCache({
        ttl: config.cache?.ttl || 3600,
        url: config.cache?.redisUrl || 'redis://redis:6379'
      });
      
      try {
        await this._cacheService.connect();
      } catch (err) {
        console.warn('No se pudo conectar a Redis. La API funcionará sin caché:', err.message);
      }
    }

    this._initialized = true;
  }

  get database() {
    if (!this._initialized) {
      throw new Error('El contenedor de dependencias no ha sido inicializado. Llame a initialize() primero.');
    }
    return this._database;
  }

  get cacheService() {
    if (!this._initialized) {
      throw new Error('El contenedor de dependencias no ha sido inicializado. Llame a initialize() primero.');
    }
    return this._cacheService;
  }

  async close() {
    if (this._cacheService) {
      await this._cacheService.close();
    }
    
    if (this._database) {
      await this._database.close();
    }
    
    this._initialized = false;
  }

  // Método útil para tests
  async reset() {
    if (this._database) {
      await this._database.clearDatabase();
    }
    
    if (this._cacheService && this._cacheService.cache) {
      this._cacheService.cache.clear();
    }
  }
}

// Exportar una única instancia (singleton)
const container = new DependencyContainer();
export default container;