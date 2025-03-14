import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';

// Mock express Router
const mockRouter = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
};

vi.mock('express', () => ({
  default: {
    Router: vi.fn(() => mockRouter)
  }
}));

// Import after mocks
import { setupServiceRoutes } from '../../../src/routes/ServiceRoutes.js';

describe('ServiceRoutes', () => {
  let mockServiceController;
  let mockCacheMiddleware;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock service controller methods
    mockServiceController = {
      getAll: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    };

    // Add bind method to each controller function
    Object.keys(mockServiceController).forEach(key => {
      mockServiceController[key].bind = vi.fn().mockReturnValue(mockServiceController[key]);
    });

    // Mock cache middleware methods
    mockCacheMiddleware = {
      cache: vi.fn((prefix, keyGenerator) => {
        const middleware = (req, res, next) => next();
        // Store the arguments for testing
        middleware.prefix = prefix;
        middleware.keyGenerator = keyGenerator;
        return middleware;
      }),
      invalidateCache: vi.fn((pattern) => {
        const middleware = (req, res, next) => next();
        middleware.pattern = pattern;
        return middleware;
      })
    };
  });

  describe('Route setup', () => {
    beforeEach(() => {
      // Setup routes with mocked dependencies
      setupServiceRoutes(mockServiceController, mockCacheMiddleware);
    });

    describe('GET routes', () => {
      it('should setup GET / route with cache middleware', () => {
        const [path, cacheMiddlewareFn, controllerFn] = mockRouter.get.mock.calls[0];
        
        expect(path).toBe('/');
        expect(cacheMiddlewareFn.prefix).toBe('services');
        expect(controllerFn).toBe(mockServiceController.getAll);
        expect(mockServiceController.getAll.bind).toHaveBeenCalledWith(mockServiceController);
      });

      it('should setup GET /:id route with cache middleware and key generator', () => {
        const [path, cacheMiddlewareFn, controllerFn] = mockRouter.get.mock.calls[1];
        
        expect(path).toBe('/:id');
        expect(cacheMiddlewareFn.prefix).toBe('services');
        expect(typeof cacheMiddlewareFn.keyGenerator).toBe('function');
        expect(controllerFn).toBe(mockServiceController.getById);
        
        // Test key generator
        const mockReq = { params: { id: '123' } };
        expect(cacheMiddlewareFn.keyGenerator(mockReq)).toBe('id:123');
      });
    });

    describe('Modification routes', () => {
      it('should setup POST / route with cache invalidation', () => {
        const [path, invalidateMiddlewareFn, controllerFn] = mockRouter.post.mock.calls[0];
        
        expect(path).toBe('/');
        expect(invalidateMiddlewareFn.pattern).toBe('services:*');
        expect(controllerFn).toBe(mockServiceController.create);
        expect(mockServiceController.create.bind).toHaveBeenCalledWith(mockServiceController);
      });

      it('should setup PUT /:id route with cache invalidation', () => {
        const [path, invalidateMiddlewareFn, controllerFn] = mockRouter.put.mock.calls[0];
        
        expect(path).toBe('/:id');
        expect(invalidateMiddlewareFn.pattern).toBe('services:*');
        expect(controllerFn).toBe(mockServiceController.update);
        expect(mockServiceController.update.bind).toHaveBeenCalledWith(mockServiceController);
      });

      it('should setup DELETE /:id route with cache invalidation', () => {
        const [path, invalidateMiddlewareFn, controllerFn] = mockRouter.delete.mock.calls[0];
        
        expect(path).toBe('/:id');
        expect(invalidateMiddlewareFn.pattern).toBe('services:*');
        expect(controllerFn).toBe(mockServiceController.delete);
        expect(mockServiceController.delete.bind).toHaveBeenCalledWith(mockServiceController);
      });
    });
  });

  describe('Router configuration', () => {
    it('should return the configured router', () => {
      const router = setupServiceRoutes(mockServiceController, mockCacheMiddleware);
      expect(router).toBe(mockRouter);
    });
  });

  describe('Cache configuration', () => {
    beforeEach(() => {
      setupServiceRoutes(mockServiceController, mockCacheMiddleware);
    });

    it('should use correct cache prefix for all routes', () => {
      // Check GET routes cache configuration
      const getAllCache = mockRouter.get.mock.calls[0][1];
      const getByIdCache = mockRouter.get.mock.calls[1][1];
      
      expect(getAllCache.prefix).toBe('services');
      expect(getByIdCache.prefix).toBe('services');
    });

    it('should use correct invalidation pattern for modification routes', () => {
      const postInvalidate = mockRouter.post.mock.calls[0][1];
      const putInvalidate = mockRouter.put.mock.calls[0][1];
      const deleteInvalidate = mockRouter.delete.mock.calls[0][1];
      
      expect(postInvalidate.pattern).toBe('services:*');
      expect(putInvalidate.pattern).toBe('services:*');
      expect(deleteInvalidate.pattern).toBe('services:*');
    });
  });
});
