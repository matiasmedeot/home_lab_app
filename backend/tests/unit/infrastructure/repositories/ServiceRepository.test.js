import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceRepository } from '../../../../src/infrastructure/repositories/ServiceRepository.js';
import { Service } from '../../../../src/domain/models/Service.js';

describe('ServiceRepository', () => {
  let mockDatabase;
  let repository;
  let mockServiceModel;

  beforeEach(() => {
    // Create mock for the Sequelize model
    mockServiceModel = {
      findAll: vi.fn(),
      findByPk: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      destroy: vi.fn()
    };
    
    // Create mock for the database
    mockDatabase = {
      getModels: vi.fn().mockReturnValue({
        Service: mockServiceModel
      })
    };
    
    repository = new ServiceRepository(mockDatabase);
  });

  it('should get all services', async () => {
    const mockData = [
      { 
        id: 1, 
        title: 'Service 1', 
        description: 'Desc 1', 
        link: 'https://one.com', 
        imageUrl: 'one.jpg',
        toJSON: () => ({ id: 1, title: 'Service 1', description: 'Desc 1', link: 'https://one.com', imageUrl: 'one.jpg' })
      },
      { 
        id: 2, 
        title: 'Service 2', 
        description: 'Desc 2', 
        link: 'https://two.com', 
        imageUrl: 'two.jpg',
        toJSON: () => ({ id: 2, title: 'Service 2', description: 'Desc 2', link: 'https://two.com', imageUrl: 'two.jpg' })
      }
    ];
    
    mockServiceModel.findAll.mockResolvedValue(mockData);
    
    const services = await repository.findAll();
    
    expect(mockServiceModel.findAll).toHaveBeenCalled();
    expect(services).toHaveLength(2);
    expect(services[0]).toBeInstanceOf(Service);
    expect(services[0].id).toBe(1);
    expect(services[1].id).toBe(2);
  });

  it('should get service by id', async () => {
    const mockData = { 
      id: 1, 
      title: 'Service 1', 
      description: 'Desc 1', 
      link: 'https://one.com', 
      imageUrl: 'one.jpg',
      toJSON: () => ({ id: 1, title: 'Service 1', description: 'Desc 1', link: 'https://one.com', imageUrl: 'one.jpg' })
    };
    
    mockServiceModel.findByPk.mockResolvedValue(mockData);
    
    const service = await repository.findById(1);
    
    expect(mockServiceModel.findByPk).toHaveBeenCalledWith(1);
    expect(service).toBeInstanceOf(Service);
    expect(service.id).toBe(1);
  });

  it('should return null if service not found', async () => {
    mockServiceModel.findByPk.mockResolvedValue(null);
    
    const service = await repository.findById(999);
    
    expect(service).toBeNull();
  });

  it('should create a service', async () => {
    const inputService = new Service(null, 'New Service', 'New Description', 'https://new.com', 'new.jpg');
    
    const createdModelInstance = { 
      id: 1, 
      title: 'New Service', 
      description: 'New Description', 
      link: 'https://new.com', 
      imageUrl: 'new.jpg',
      toJSON: () => ({ id: 1, title: 'New Service', description: 'New Description', link: 'https://new.com', imageUrl: 'new.jpg' })
    };
    
    mockServiceModel.create.mockResolvedValue(createdModelInstance);
    
    const created = await repository.create(inputService);
    
    expect(mockServiceModel.create).toHaveBeenCalledWith({
      title: 'New Service',
      description: 'New Description',
      link: 'https://new.com',
      imageUrl: 'new.jpg'
    });
    
    expect(created).toBeInstanceOf(Service);
    expect(created.id).toBe(1);
    expect(created.title).toBe('New Service');
  });

  it('should validate service before create', async () => {
    const invalidService = new Service(null, '', 'Description', 'https://test.com');
    
    await expect(repository.create(invalidService)).rejects.toThrow('El título es obligatorio');
    expect(mockServiceModel.create).not.toHaveBeenCalled();
  });

  it('should update a service', async () => {
    const service = new Service(1, 'Updated Service', 'Updated Description', 'https://updated.com', 'updated.jpg');
    
    // Mock the update method to return 1 (number of updated rows)
    mockServiceModel.update.mockResolvedValue([1]);
    
    // Mock the findByPk to return the updated instance
    const updatedInstance = {
      id: 1, 
      title: 'Updated Service', 
      description: 'Updated Description', 
      link: 'https://updated.com', 
      imageUrl: 'updated.jpg',
      toJSON: () => ({ id: 1, title: 'Updated Service', description: 'Updated Description', link: 'https://updated.com', imageUrl: 'updated.jpg' })
    };
    
    mockServiceModel.findByPk.mockResolvedValue(updatedInstance);
    
    const updated = await repository.update(1, service);
    
    expect(mockServiceModel.update).toHaveBeenCalledWith(
      {
        title: 'Updated Service',
        description: 'Updated Description',
        link: 'https://updated.com',
        imageUrl: 'updated.jpg'
      },
      { where: { id: 1 } }
    );
    
    expect(updated).toBeInstanceOf(Service);
    expect(updated.id).toBe(1);
    expect(updated.title).toBe('Updated Service');
  });

  it('should throw error if service not found during update', async () => {
    const service = new Service(999, 'Updated Service', 'Updated Description', 'https://updated.com', 'updated.jpg');
    
    // Mock update to return 0 (no rows updated)
    mockServiceModel.update.mockResolvedValue([0]);
    
    await expect(repository.update(999, service)).rejects.toThrow('Servicio con ID 999 no encontrado');
  });

  it('should delete a service', async () => {
    // Mock destroy to return 1 (indicating 1 row deleted)
    mockServiceModel.destroy.mockResolvedValue(1);
    
    const result = await repository.delete(1);
    
    expect(mockServiceModel.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toBe(true);
  });

  it('should throw error if service not found during delete', async () => {
    // Mock destroy to return 0 (no rows deleted)
    mockServiceModel.destroy.mockResolvedValue(0);
    
    await expect(repository.delete(999)).rejects.toThrow('Servicio con ID 999 no encontrado');
  });
});