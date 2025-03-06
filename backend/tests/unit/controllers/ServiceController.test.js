import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceController } from '../../../src/controllers/ServiceController.js';
import { Service } from '../../../src/domain/models/Service.js';

describe('ServiceController', () => {
  let mockUseCases;
  let controller;
  let mockReq;
  let mockRes;
  let testService;

  beforeEach(() => {
    testService = new Service(1, 'Test Service', 'Test Description', 'https://test.com');
    
    mockUseCases = {
      getAllServices: vi.fn().mockResolvedValue([testService]),
      getServiceById: vi.fn().mockResolvedValue(testService),
      createService: vi.fn().mockImplementation(data => {
        const service = Service.fromDTO(data);
        service.id = 1;
        return Promise.resolve(service);
      }),
      updateService: vi.fn().mockImplementation((id, data) => {
        const service = Service.fromDTO({ ...data, id: parseInt(id) });
        return Promise.resolve(service);
      }),
      deleteService: vi.fn().mockResolvedValue(true)
    };
    
    controller = new ServiceController(mockUseCases);
    
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
  });

  it('should get all services', async () => {
    mockReq = {};
    
    await controller.getAll(mockReq, mockRes);
    
    expect(mockUseCases.getAllServices).toHaveBeenCalled();
    expect(mockRes.json).toHaveBeenCalledWith([testService.toDTO()]);
  });

  it('should handle errors in getAll', async () => {
    mockReq = {};
    mockUseCases.getAllServices.mockRejectedValue(new Error('Test error'));
    
    await controller.getAll(mockReq, mockRes);
    
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Test error' });
  });

  it('should get service by id', async () => {
    mockReq = { params: { id: '1' } };
    
    await controller.getById(mockReq, mockRes);
    
    expect(mockUseCases.getServiceById).toHaveBeenCalledWith('1');
    expect(mockRes.json).toHaveBeenCalledWith(testService.toDTO());
  });

  it('should handle not found in getById', async () => {
    mockReq = { params: { id: '999' } };
    mockUseCases.getServiceById.mockResolvedValue(null);
    
    await controller.getById(mockReq, mockRes);
    
    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Servicio no encontrado' });
  });

  it('should create a service', async () => {
    mockReq = {
      body: {
        title: 'New Service',
        description: 'New Description',
        link: 'https://new.com',
        imageUrl: 'new.jpg'
      }
    };
    
    await controller.create(mockReq, mockRes);
    
    expect(mockUseCases.createService).toHaveBeenCalledWith(mockReq.body);
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalled();
  });

  it('should update a service', async () => {
    mockReq = {
      params: { id: '1' },
      body: {
        title: 'Updated Service',
        description: 'Updated Description',
        link: 'https://updated.com',
        imageUrl: 'updated.jpg'
      }
    };
    
    await controller.update(mockReq, mockRes);
    
    expect(mockUseCases.updateService).toHaveBeenCalledWith('1', mockReq.body);
    expect(mockRes.json).toHaveBeenCalled();
  });

  it('should delete a service', async () => {
    mockReq = { params: { id: '1' } };
    
    await controller.delete(mockReq, mockRes);
    
    expect(mockUseCases.deleteService).toHaveBeenCalledWith('1');
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Servicio eliminado' });
  });
});