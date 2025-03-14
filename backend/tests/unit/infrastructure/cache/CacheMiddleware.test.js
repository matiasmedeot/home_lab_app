import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CacheMiddleware } from '../../../../src/infrastructure/cache/CacheMiddleware';

describe('CacheMiddleware', () => {
  let cacheMiddleware;
  let mockCacheService;
  let req;
  let res;
  let next;

  beforeEach(() => {
    // Mock cache service
    mockCacheService = {
      get: vi.fn(),
      set: vi.fn(),
      invalidatePattern: vi.fn()
    };

    // Create middleware instance
    cacheMiddleware = new CacheMiddleware(mockCacheService);

    // Mock request object
    req = {
      method: 'GET',
      originalUrl: '/api/test'
    };

    // Mock response object
    res = {
      json: vi.fn((data) => data),
      status: vi.fn(function(code) {
        this.statusCode = code;
        return this;
      })
    };

    // Mock next function
    next = vi.fn();

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('cache middleware', () => {
    it('should skip cache for non-GET requests', async () => {
      req.method = 'POST';
      const middleware = cacheMiddleware.cache('test');
      
      await middleware(req, res, next);
      
      expect(mockCacheService.get).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should return cached data when available', async () => {
      const cachedData = { id: 1, name: 'test' };
      mockCacheService.get.mockResolvedValue(cachedData);
      const middleware = cacheMiddleware.cache('test');
      
      await middleware(req, res, next);
      
      expect(mockCacheService.get).toHaveBeenCalledWith('test:/api/test');
      expect(res.json).toHaveBeenCalledWith(cachedData);
      expect(next).not.toHaveBeenCalled();
    });

    it('should proceed and cache response when cache miss', async () => {
      mockCacheService.get.mockResolvedValue(null);
      const middleware = cacheMiddleware.cache('test');
      const responseData = { id: 1, name: 'test' };
      
      await middleware(req, res, next);
      
      // Simulate response
      res.json(responseData);
      
      expect(mockCacheService.get).toHaveBeenCalledWith('test:/api/test');
      expect(mockCacheService.set).toHaveBeenCalledWith('test:/api/test', responseData, null);
      expect(next).toHaveBeenCalled();
    });

    it('should use custom key generator function', async () => {
      const getKey = (req) => `custom:${req.originalUrl}`;
      const middleware = cacheMiddleware.cache('test', getKey);
      
      await middleware(req, res, next);
      
      expect(mockCacheService.get).toHaveBeenCalledWith('test:custom:/api/test');
    });

    it('should use custom TTL when provided', async () => {
      mockCacheService.get.mockResolvedValue(null);
      const customTTL = 3600;
      const middleware = cacheMiddleware.cache('test', req => req.originalUrl, customTTL);
      const responseData = { id: 1, name: 'test' };
      
      await middleware(req, res, next);
      res.json(responseData);
      
      expect(mockCacheService.set).toHaveBeenCalledWith('test:/api/test', responseData, customTTL);
    });

    it('should handle cache service errors gracefully', async () => {
      mockCacheService.get.mockRejectedValue(new Error('Cache error'));
      const middleware = cacheMiddleware.cache('test');
      
      await middleware(req, res, next);
      
      expect(console.error).toHaveBeenCalledWith('Error en middleware de caché:', expect.any(Error));
      expect(next).toHaveBeenCalled();
    });
  });

  describe('invalidateCache middleware', () => {
    it('should invalidate cache on successful response', async () => {
      const middleware = cacheMiddleware.invalidateCache('test:*');
      const responseData = { success: true };
      
      await middleware(req, res, next);
      
      // Simulate successful response
      res.status(200);
      res.json(responseData);
      
      expect(mockCacheService.invalidatePattern).toHaveBeenCalledWith('test:*');
    });

    it('should not invalidate cache on error response', async () => {
      const middleware = cacheMiddleware.invalidateCache('test:*');
      const errorData = { error: 'Not found' };
      
      await middleware(req, res, next);
      
      // Simulate error response
      res.status(404);
      res.json(errorData);
      
      expect(mockCacheService.invalidatePattern).not.toHaveBeenCalled();
    });

    it('should preserve original response methods', async () => {
      const middleware = cacheMiddleware.invalidateCache('test:*');
      const responseData = { success: true };
      const originalJson = res.json;
      const originalStatus = res.status;
      
      await middleware(req, res, next);
      
      // Simulate response
      res.status(200);
      res.json(responseData);
      
      expect(res.json).toBe(originalJson);
      expect(res.status).toBe(originalStatus);
    });

    it('should handle all successful status codes (200-299)', async () => {
      const middleware = cacheMiddleware.invalidateCache('test:*');
      const responseData = { success: true };
      const successCodes = [200, 201, 204, 299];
      
      for (const code of successCodes) {
        mockCacheService.invalidatePattern.mockClear();
        await middleware(req, res, next);
        
        res.status(code);
        res.json(responseData);
        
        expect(mockCacheService.invalidatePattern).toHaveBeenCalledWith('test:*');
      }
    });

    it('should not invalidate cache for non-success status codes', async () => {
      const middleware = cacheMiddleware.invalidateCache('test:*');
      const responseData = { message: 'test' };
      const nonSuccessCodes = [100, 300, 400, 500];
      
      for (const code of nonSuccessCodes) {
        mockCacheService.invalidatePattern.mockClear();
        await middleware(req, res, next);
        
        res.status(code);
        res.json(responseData);
        
        expect(mockCacheService.invalidatePattern).not.toHaveBeenCalled();
      }
    });
  });
});
