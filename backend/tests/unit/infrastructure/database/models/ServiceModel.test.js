import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { Sequelize } from 'sequelize';
import ServiceModel from '../../../../../src/infrastructure/database/models/ServiceModel.js';

describe('ServiceModel', () => {
  let sequelize;
  let Service;

  beforeAll(() => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false
    });
    Service = ServiceModel.init(sequelize);
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    if (sequelize) {
      await sequelize.close();
    }
  });

  describe('model definition', () => {
    it('should have correct table name', () => {
      expect(Service.tableName).toBe('services');
    });

    it('should have timestamps disabled', () => {
      expect(Service.options.timestamps).toBe(false);
    });

    it('should have correct model name', () => {
      expect(Service.name).toBe('Service');
    });
  });

  describe('field definitions', () => {
    it('should have an auto-incrementing id field', () => {
      const idField = Service.rawAttributes.id;
      expect(idField.type instanceof Sequelize.INTEGER).toBe(true);
      expect(idField.primaryKey).toBe(true);
      expect(idField.autoIncrement).toBe(true);
    });

    it('should have required title field with validation', () => {
      const titleField = Service.rawAttributes.title;
      expect(titleField.type instanceof Sequelize.STRING).toBe(true);
      expect(titleField.allowNull).toBe(false);
      expect(titleField.validate).toHaveProperty('notEmpty', true);
    });

    it('should have required description field', () => {
      const descField = Service.rawAttributes.description;
      expect(descField.type instanceof Sequelize.TEXT).toBe(true);
      expect(descField.allowNull).toBe(false);
    });

    it('should have required link field', () => {
      const linkField = Service.rawAttributes.link;
      expect(linkField.type instanceof Sequelize.STRING).toBe(true);
      expect(linkField.allowNull).toBe(false);
    });

    it('should have optional imageUrl field', () => {
      const imageField = Service.rawAttributes.imageUrl;
      expect(imageField.type instanceof Sequelize.STRING).toBe(true);
      expect(imageField.allowNull).toBe(true);
    });
  });

  describe('model operations', () => {
    it('should create a service with valid data', async () => {
      const serviceData = {
        title: 'Test Service',
        description: 'Test Description',
        link: 'http://test.com',
        imageUrl: 'http://test.com/image.jpg'
      };

      const service = await Service.create(serviceData);
      
      expect(service.id).toBeDefined();
      expect(service.title).toBe(serviceData.title);
      expect(service.description).toBe(serviceData.description);
      expect(service.link).toBe(serviceData.link);
      expect(service.imageUrl).toBe(serviceData.imageUrl);
    });

    it('should create a service without imageUrl', async () => {
      const serviceData = {
        title: 'Test Service Without Image',
        description: 'Test Description',
        link: 'http://test.com',
        imageUrl: null
      };

      const service = await Service.create(serviceData);
      
      expect(service.id).toBeDefined();
      expect(service.title).toBe(serviceData.title);
      expect(service.description).toBe(serviceData.description);
      expect(service.link).toBe(serviceData.link);
      expect(service.imageUrl).toBe(null);
    });

    it('should fail when creating service without title', async () => {
      const serviceData = {
        description: 'Test Description',
        link: 'http://test.com'
      };

      await expect(Service.create(serviceData)).rejects.toThrow();
    });

    it('should fail when creating service with empty title', async () => {
      const serviceData = {
        title: '',
        description: 'Test Description',
        link: 'http://test.com'
      };

      await expect(Service.create(serviceData)).rejects.toThrow();
    });

    it('should fail when creating service without description', async () => {
      const serviceData = {
        title: 'Test Service',
        link: 'http://test.com'
      };

      await expect(Service.create(serviceData)).rejects.toThrow();
    });

    it('should fail when creating service without link', async () => {
      const serviceData = {
        title: 'Test Service',
        description: 'Test Description'
      };

      await expect(Service.create(serviceData)).rejects.toThrow();
    });
  });
});
