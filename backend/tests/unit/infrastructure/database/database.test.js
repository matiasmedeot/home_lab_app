import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';

// Mock declarations must be before any imports that use them
vi.mock('sequelize', () => ({
  Sequelize: vi.fn(() => mockSequelizeInstance)
}));

vi.mock('../../../../src/infrastructure/database/models/ServiceModel.js', () => ({
  default: {
    init: vi.fn(() => mockServiceModel)
  }
}));

// Import after mocks
import { Database } from '../../../../src/infrastructure/database/database.js';
import { Sequelize } from 'sequelize';
import ServiceModel from '../../../../src/infrastructure/database/models/ServiceModel.js';

// Mock objects must be defined before they are used in mocks
const mockServiceModel = {
  tableName: 'services',
  name: 'Service'
};

const mockSequelizeInstance = {
  sync: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  define: vi.fn(),
  authenticate: vi.fn().mockResolvedValue(undefined)
};

describe('Database', () => {
  let database;
  
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'test';
    database = new Database();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    await database?.close();
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(database.dataDir).toBe('/data');
      expect(database.options).toEqual({});
      expect(database.sequelize).toBeNull();
      expect(database.models).toEqual({});
    });

    it('should initialize with custom values', () => {
      const customDir = '/custom/data';
      const customOptions = { logging: true };
      database = new Database(customDir, customOptions);
      
      expect(database.dataDir).toBe(customDir);
      expect(database.options).toEqual(customOptions);
    });
  });

  describe('connect', () => {
    it('should connect to in-memory database in test environment', async () => {
      await database.connect();
      
      expect(Sequelize).toHaveBeenCalledWith({
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false
      });
      expect(database.sequelize).toBe(mockSequelizeInstance);
      expect(ServiceModel.init).toHaveBeenCalledWith(mockSequelizeInstance);
      expect(database.models.Service).toBe(mockServiceModel);
      expect(mockSequelizeInstance.sync).toHaveBeenCalled();
    });

    it('should connect to file database in non-test environment', async () => {
      process.env.NODE_ENV = 'development';
      await database.connect();
      
      expect(Sequelize).toHaveBeenCalledWith({
        dialect: 'sqlite',
        storage: path.join('/data', 'homelab.db'),
        logging: false
      });
      expect(database.sequelize).toBe(mockSequelizeInstance);
      expect(ServiceModel.init).toHaveBeenCalledWith(mockSequelizeInstance);
      expect(database.models.Service).toBe(mockServiceModel);
    });

    it('should handle connection errors', async () => {
      const mockError = new Error('Connection failed');
      mockSequelizeInstance.sync.mockRejectedValueOnce(mockError);
      
      await expect(database.connect()).rejects.toThrow('Connection failed');
      expect(console.error).toHaveBeenCalledWith(
        'Error conectando a la base de datos:',
        mockError
      );
    });
  });

  describe('close', () => {
    it('should close database connection', async () => {
      await database.connect();
      await database.close();
      expect(mockSequelizeInstance.close).toHaveBeenCalled();
    });

    it('should handle closing when not connected', async () => {
      await expect(database.close()).resolves.not.toThrow();
    });
  });

  describe('getModels', () => {
    it('should return initialized models after connection', async () => {
      await database.connect();
      const models = database.getModels();
      
      expect(models).toBeDefined();
      expect(models.Service).toBe(mockServiceModel);
      expect(models.Service.tableName).toBe('services');
    });

    it('should return empty object before connection', () => {
      const models = database.getModels();
      expect(models).toEqual({});
    });
  });

  describe('clearDatabase', () => {
    it('should reset database with force sync', async () => {
      await database.connect();
      await database.clearDatabase();
      expect(mockSequelizeInstance.sync).toHaveBeenCalledWith({ force: true });
    });

    it('should handle clearing when not connected', async () => {
      await expect(database.clearDatabase()).resolves.not.toThrow();
    });
  });
});
