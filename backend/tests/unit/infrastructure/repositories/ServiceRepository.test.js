import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceRepository } from '../../../../src/infrastructure/repositories/ServiceRepository.js';
import { Service } from '../../../../src/domain/models/Service.js';

describe('ServiceRepository', () => {
  let mockDatabase;
  let repository;
  let mockDb;

  beforeEach(() => {
    mockDb = {
      all: vi.fn(),
      get: vi.fn(),
      run: vi.fn().mockResolvedValue({ lastID: 1 })
    };
    
    mockDatabase = {
      getDb: vi.fn().mockResolvedValue(mockDb)
    };
    
    repository = new ServiceRepository(mockDatabase);
  });

  it('should get all services', async () => {
    const mockData = [
      { id: 1, title: 'Service 1', description: 'Desc 1', link: 'https://one.com', imageUrl: 'one.jpg' },
      { id: 2, title: 'Service 2', description: 'Desc 2', link: 'https://two.com', imageUrl: 'two.jpg' }
    ];
    
    mockDb.all.mockResolvedValue(mockData);
    
    const services = await repository.findAll();
    
    expect(mockDatabase.getDb).toHaveBeenCalled();
    expect(mockDb.all).toHaveBeenCalledWith('SELECT * FROM services');
    expect(services).toHaveLength(2);
    expect(services[0]).toBeInstanceOf(Service);
    expect(services[0].id).toBe(1);
    expect(services[1].id).toBe(2);
  });

  it('should get service by id', async () => {
    const mockData = { id: 1, title: 'Service 1', description: 'Desc 1', link: 'https://one.com', imageUrl: 'one.jpg' };
    mockDb.get.mockResolvedValue(mockData);
    
    const service = await repository.findById(1);
    
    expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM services WHERE id = ?', 1);
    expect(service).toBeInstanceOf(Service);
    expect(service.id).toBe(1);
  });

  it('should return null if service not found', async () => {
    mockDb.get.mockResolvedValue(undefined);
    
    const service = await repository.findById(999);
    
    expect(service).toBeNull();
  });

  it('should create a service', async () => {
    const service = new Service(null, 'New Service', 'New Description', 'https://new.com', 'new.jpg');
    
    const created = await repository.create(service);
    
    expect(mockDb.run).toHaveBeenCalledWith(
      'INSERT INTO services (title, description, link, imageUrl) VALUES (?, ?, ?, ?)',
      ['New Service', 'New Description', 'https://new.com', 'new.jpg']
    );
    expect(created.id).toBe(1);
  });

  it('should validate service before create', async () => {
    const invalidService = new Service(null, '', 'Description', 'https://test.com');
    
    await expect(repository.create(invalidService)).rejects.toThrow('El título es obligatorio');
    expect(mockDb.run).not.toHaveBeenCalled();
  });

  it('should update a service', async () => {
    const service = new Service(1, 'Updated Service', 'Updated Description', 'https://updated.com', 'updated.jpg');
    
    const updated = await repository.update(1, service);
    
    expect(mockDb.run).toHaveBeenCalledWith(
      'UPDATE services SET title = ?, description = ?, link = ?, imageUrl = ? WHERE id = ?',
      ['Updated Service', 'Updated Description', 'https://updated.com', 'updated.jpg', 1]
    );
    expect(updated.id).toBe(1);
  });

  it('should delete a service', async () => {
    const result = await repository.delete(1);
    
    expect(mockDb.run).toHaveBeenCalledWith('DELETE FROM services WHERE id = ?', 1);
    expect(result).toBe(true);
  });
});