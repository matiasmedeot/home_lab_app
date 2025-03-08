import { createClient } from 'redis';

export class RedisCache {
  constructor(options = {}) {
    this.client = null;
    this.options = {
      url: process.env.REDIS_URL || 'redis://redis:6379',
      ttl: process.env.REDIS_TTL || 3600, // 1 hora por defecto
      ...options
    };
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = createClient({
        url: this.options.url
      });

      this.client.on('error', (err) => {
        console.error('Error en la conexión Redis:', err);
        this.isConnected = false;
      });

      this.client.on('ready', () => {
        console.log('Conexión Redis establecida');
        this.isConnected = true;
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      console.error('Error al conectar con Redis:', error);
      this.isConnected = false;
      // No lanzamos el error para permitir que la aplicación funcione sin caché
    }
  }

  async get(key) {
    if (!this.isConnected || !this.client) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error al obtener clave ${key} de Redis:`, error);
      return null;
    }
  }

  async set(key, value, expireSeconds = null) {
    if (!this.isConnected || !this.client) return false;
    try {
      const ttl = expireSeconds || this.options.ttl;
      await this.client.set(key, JSON.stringify(value), { EX: ttl });
      return true;
    } catch (error) {
      console.error(`Error al guardar clave ${key} en Redis:`, error);
      return false;
    }
  }

  async invalidate(key) {
    if (!this.isConnected || !this.client) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error(`Error al invalidar clave ${key} en Redis:`, error);
      return false;
    }
  }

  async invalidatePattern(pattern) {
    if (!this.isConnected || !this.client) return false;
    try {
      // Buscar todas las claves que coincidan con el patrón
      const keys = await this.client.keys(pattern);
      
      if (keys.length > 0) {
        // Eliminar todas las claves encontradas
        await this.client.del(keys);
      }
      
      return true;
    } catch (error) {
      console.error(`Error al invalidar claves con patrón ${pattern} en Redis:`, error);
      return false;
    }
  }

  async close() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      console.log('Conexión Redis cerrada');
    }
  }
}