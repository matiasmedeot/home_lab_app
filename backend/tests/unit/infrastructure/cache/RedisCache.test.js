import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RedisCache } from '../../../../src/infrastructure/cache/RedisCache';

// Mock redis client
const mockRedisClient = {
  connect: vi.fn().mockResolvedValue(),
  quit: vi.fn().mockResolvedValue(),
  get: vi.fn(),
  set: vi.fn().mockResolvedValue('OK'),
  del: vi.fn().mockResolvedValue(1),
  keys: vi.fn(),
  on: vi.fn((event, callback) => {
    if (event === 'ready') {
      callback();
    }
  }),
};

vi.mock('redis', () => ({
  createClient: vi.fn(() => mockRedisClient)
}));

describe('RedisCache', () => {
  let redisCache;

  beforeEach(() => {
    vi.clearAllMocks();
    redisCache = new RedisCache({
      url: 'redis://localhost:6379',
      ttl: 3600
    });
  });

  afterEach(async () => {
    await redisCache.close();
  });

  describe('constructor', () => {
    it('should initialize with default options when none provided', () => {
      const cache = new RedisCache();
      expect(cache.options.url).toBe('redis://redis:6379');
      expect(cache.options.ttl).toBe(3600);
    });

    it('should initialize with provided options', () => {
      const options = { url: 'redis://custom:6379', ttl: 7200 };
      const cache = new RedisCache(options);
      expect(cache.options.url).toBe(options.url);
      expect(cache.options.ttl).toBe(options.ttl);
    });
  });

  describe('connect', () => {
    it('should connect successfully', async () => {
      await redisCache.connect();
      
      expect(redisCache.client.connect).toHaveBeenCalled();
      expect(redisCache.client.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(redisCache.client.on).toHaveBeenCalledWith('ready', expect.any(Function));
      expect(redisCache.isConnected).toBe(true);
    });

    it('should handle connection errors gracefully', async () => {
      const mockError = new Error('Connection failed');
      mockRedisClient.connect.mockRejectedValueOnce(mockError);
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation();
      await redisCache.connect();
      
      expect(consoleSpy).toHaveBeenCalledWith('Error al conectar con Redis:', mockError);
      expect(redisCache.isConnected).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('get', () => {
    it('should return null when not connected', async () => {
      redisCache.isConnected = false;
      const result = await redisCache.get('testKey');
      expect(result).toBeNull();
    });

    it('should return parsed value when key exists', async () => {
      await redisCache.connect();
      const mockValue = { test: 'data' };
      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(mockValue));

      const result = await redisCache.get('testKey');
      expect(result).toEqual(mockValue);
      expect(mockRedisClient.get).toHaveBeenCalledWith('testKey');
    });

    it('should return null when key does not exist', async () => {
      await redisCache.connect();
      mockRedisClient.get.mockResolvedValueOnce(null);

      const result = await redisCache.get('nonExistentKey');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should return false when not connected', async () => {
      redisCache.isConnected = false;
      const result = await redisCache.set('testKey', { test: 'data' });
      expect(result).toBe(false);
    });

    it('should set value with default TTL', async () => {
      await redisCache.connect();
      const value = { test: 'data' };
      
      const result = await redisCache.set('testKey', value);
      
      expect(result).toBe(true);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'testKey',
        JSON.stringify(value),
        { EX: redisCache.options.ttl }
      );
    });

    it('should set value with custom TTL', async () => {
      await redisCache.connect();
      const value = { test: 'data' };
      const customTTL = 7200;
      
      const result = await redisCache.set('testKey', value, customTTL);
      
      expect(result).toBe(true);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'testKey',
        JSON.stringify(value),
        { EX: customTTL }
      );
    });
  });

  describe('invalidate', () => {
    it('should return false when not connected', async () => {
      redisCache.isConnected = false;
      const result = await redisCache.invalidate('testKey');
      expect(result).toBe(false);
    });

    it('should successfully invalidate key', async () => {
      await redisCache.connect();
      mockRedisClient.del.mockResolvedValueOnce(1);

      const result = await redisCache.invalidate('testKey');
      
      expect(result).toBe(true);
      expect(mockRedisClient.del).toHaveBeenCalledWith('testKey');
    });
  });

  describe('invalidatePattern', () => {
    it('should return false when not connected', async () => {
      redisCache.isConnected = false;
      const result = await redisCache.invalidatePattern('test*');
      expect(result).toBe(false);
    });

    it('should successfully invalidate multiple keys', async () => {
      await redisCache.connect();
      const mockKeys = ['test1', 'test2', 'test3'];
      mockRedisClient.keys.mockResolvedValueOnce(mockKeys);
      mockRedisClient.del.mockResolvedValueOnce(mockKeys.length);

      const result = await redisCache.invalidatePattern('test*');
      
      expect(result).toBe(true);
      expect(mockRedisClient.keys).toHaveBeenCalledWith('test*');
      expect(mockRedisClient.del).toHaveBeenCalledWith(mockKeys);
    });

    it('should handle empty key list', async () => {
      await redisCache.connect();
      mockRedisClient.keys.mockResolvedValueOnce([]);

      const result = await redisCache.invalidatePattern('nonexistent*');
      
      expect(result).toBe(true);
      expect(mockRedisClient.keys).toHaveBeenCalledWith('nonexistent*');
      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('should close connection successfully', async () => {
      await redisCache.connect();
      await redisCache.close();
      
      expect(mockRedisClient.quit).toHaveBeenCalled();
      expect(redisCache.isConnected).toBe(false);
    });

    it('should handle when no client exists', async () => {
      redisCache.client = null;
      await redisCache.close();
      expect(redisCache.isConnected).toBe(false);
    });
  });
});
