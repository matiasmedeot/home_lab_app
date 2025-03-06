import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceUseCases } from '../../../../src/application/usecases/ServiceUseCases.js';
import { Service } from '../../../../src/domain/models/Service.js';

describe('ServiceUseCases', () => {
  let mockRepository;
  let serviceUseCases;
  let testService;

  beforeEach(() => {
    testService = new Service(1, 'Test Service', 'Test Description', 'https://test.com');
    
    mockRepository = {
      findAll: vi.fn().mockResolvedValue([testService]),
      findById: vi.fn().mockResolvedValue(testService),
      create: vi.fn().mockImplementation(service => {
        service.id = 1;
        return Promise.resolve(service);
      }),
      update: vi.fn().mockImplementation((id, service) => {
        service.id = parseInt(id);
        return Promise.resolve(service);
      }),
      delete: vi.fn().mockResolvedValue(true)
    };
    
    serviceUseCases = new ServiceUseCases(mockRepository);
  });

  it('should get all services', async () => {
    const services = await serviceUseCases.getAllServices();
    
    expect(mockRepository.findAll).toHaveBeenCalled();
    expect(services).toHaveLength(1);
    expect(services[0]).toBe(testService);
  });

  it('should get service by id', async () => {
    const service = await serviceUseCases.getServiceById(1);
    
    expect(mockRepository.findById).toHaveBeenCalledWith(1);
    expect(service).toBe(testService);
  });

  it('should create a service', async () => {
    const dto = {
      title: 'New Service',
      description: 'New Description',
      link: 'https://new.com',
      imageUrl: 'new.jpg'
    };
    
    const createdService = await serviceUseCases.createService(dto);
    
    expect(mockRepository.create).toHaveBeenCalled();
    expect(createdService.id).toBe(1);
    expect(createdService.title).toBe('New Service');
  });

  it('should update a service', async () => {
    const dto = {
      title: 'Updated Service',
      description: 'Updated Description',
      link: 'https://updated.com',
      imageUrl: 'updated.jpg'
    };
    
    const updatedService = await serviceUseCases.updateService(1, dto);
    
    expect(mockRepository.update).toHaveBeenCalledWith(1, expect.any(Service));
    expect(updatedService.id).toBe(1);
    expect(updatedService.title).toBe('Updated Service');
  });

  it('should delete a service', async () => {
    const result = await serviceUseCases.deleteService(1);
    
    expect(mockRepository.delete).toHaveBeenCalledWith(1);
    expect(result).toBe(true);
  });
});
