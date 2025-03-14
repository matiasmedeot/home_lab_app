import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Database and RedisCache before importing container
const mockDatabase = {
  connect: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  clearDatabase: vi.fn().mockResolvedValue(undefined),
  models: {}
};

const mockRedisCache = {
  connect: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  isConnected: true,
  get: vi.fn(),
  set: vi.fn(),
  invalidate: vi.fn(),
  invalidatePattern: vi.fn()
};

vi.mock('../../../../src/infrastructure/database/database.js', () => ({
  Database: vi.fn().mockImplementation(() => mockDatabase)
}));

vi.mock('../../../../src/infrastructure/cache/RedisCache.js', () => ({
  RedisCache: vi.fn().mockImplementation(() => mockRedisCache)
}));

// Import after mocks
import container from '../../../../src/infrastructure/container/dependency_container.js';
import { Database } from '../../../../src/infrastructure/database/database.js';
import { RedisCache } from '../../../../src/infrastructure/cache/RedisCache.js';

describe('DependencyContainer', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'test';
    await container.close();
  });

  afterEach(async () => {
    await container.close();
  });

  describe('initialization', () => {
    it('should initialize container in test mode', async () => {
      await container.initialize();
      
      expect(container._initialized).toBe(true);
      expect(container._database).toBeDefined();
      expect(container._cacheService).toBeDefined();
      expect(container._cacheService.constructor.name).toBe('MockRedisCache');
      expect(Database).toHaveBeenCalledWith(null);
    });

    it('should initialize container in development mode', async () => {
      process.env.NODE_ENV = 'development';
      await container.initialize();
      
      expect(container._initialized).toBe(true);
      expect(container._database).toBeDefined();
      expect(container._cacheService).toBeDefined();
      expect(RedisCache).toHaveBeenCalledWith({
        ttl: expect.any(Number),
        url: expect.stringContaining('redis://')
      });
    });

    it('should not initialize twice', async () => {
      await container.initialize();
      const originalDatabase = container._database;
      const originalCache = container._cacheService;

      await container.initialize();

      expect(Database).toHaveBeenCalledTimes(1);
      expect(container._database).toBe(originalDatabase);
      expect(container._cacheService).toBe(originalCache);
    });

    it('should throw error when accessing services before initialization', async () => {
      await container.close();
      expect(() => container.database).toThrow('El contenedor de dependencias no ha sido inicializado');
      expect(() => container.cacheService).toThrow('El contenedor de dependencias no ha sido inicializado');
    });
  });

  describe('database access', () => {
    it('should provide access to database after initialization', async () => {
      await container.initialize();
      expect(container.database).toBeDefined();
      expect(container.database.models).toBeDefined();
      expect(mockDatabase.connect).toHaveBeenCalled();
    });
  });

  describe('cache service access', () => {
    it('should provide access to cache service after initialization', async () => {
      await container.initialize();
      expect(container.cacheService).toBeDefined();
      expect(container.cacheService.isConnected).toBe(true);
    });

    it('should handle redis connection failure gracefully', async () => {
      process.env.NODE_ENV = 'development';
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockError = new Error('Redis connection failed');
      RedisCache.mockImplementationOnce(() => ({
        connect: vi.fn().mockRejectedValue(mockError),
        close: vi.fn().mockResolvedValue(undefined)
      }));

      await container.initialize();
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'No se pudo conectar a Redis. La API funcionará sin caché:',
        mockError.message
      );
    });
  });

  describe('reset', () => {
    it('should clear database and cache', async () => {
      await container.initialize();
      await container.reset();
      
      expect(mockDatabase.clearDatabase).toHaveBeenCalled();
      expect(container._cacheService.cache.size).toBe(0);
    });
  });

  describe('close', () => {
    it('should close all services and reset initialization flag', async () => {
      await container.initialize();
      const database = container.database;
      const cache = container.cacheService;
      
      await container.close();
      
      expect(container._initialized).toBe(false);
      expect(mockDatabase.close).toHaveBeenCalled();
      expect(() => container.database).toThrow('El contenedor de dependencias no ha sido inicializado');
      expect(() => container.cacheService).toThrow('El contenedor de dependencias no ha sido inicializado');
    });

    it('should handle close when not initialized', async () => {
      await expect(container.close()).resolves.not.toThrow();
    });
  });

  describe('MockRedisCache', () => {
    let mockCache;

    beforeEach(async () => {
      await container.initialize();
      mockCache = container.cacheService;
    });

    it('should store and retrieve values', async () => {
      const key = 'test';
      const value = { data: 'test' };
      
      await mockCache.set(key, value);
      const result = await mockCache.get(key);
      
      expect(result).toEqual(value);
    });

    it('should return null for non-existent keys', async () => {
      const result = await mockCache.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should invalidate specific keys', async () => {
      await mockCache.set('key1', 'value1');
      await mockCache.invalidate('key1');
      
      const result = await mockCache.get('key1');
      expect(result).toBeNull();
    });

    it('should invalidate keys by pattern', async () => {
      await mockCache.set('test:1', 'value1');
      await mockCache.set('test:2', 'value2');
      await mockCache.set('other:1', 'value3');
      
      await mockCache.invalidatePattern('test:*');
      
      expect(await mockCache.get('test:1')).toBeNull();
      expect(await mockCache.get('test:2')).toBeNull();
      expect(await mockCache.get('other:1')).not.toBeNull();
    });

    it('should clear all data on close', async () => {
      await mockCache.set('key1', 'value1');
      await mockCache.close();
      
      expect(await mockCache.get('key1')).toBeNull();
    });
  });
});
