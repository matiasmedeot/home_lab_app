import { describe, it, expect } from 'vitest';
import { Service } from '../../../../src/domain/models/Service.js';

describe('Service Model', () => {
  it('should create a valid service', () => {
    const service = new Service(1, 'Test Service', 'Test Description', 'https://test.com', 'image.jpg');
    
    expect(service.id).toBe(1);
    expect(service.title).toBe('Test Service');
    expect(service.description).toBe('Test Description');
    expect(service.link).toBe('https://test.com');
    expect(service.imageUrl).toBe('image.jpg');
  });

  it('should create a service from DTO', () => {
    const dto = {
      id: 1,
      title: 'Test Service',
      description: 'Test Description',
      link: 'https://test.com',
      imageUrl: 'image.jpg'
    };
    
    const service = Service.fromDTO(dto);
    
    expect(service).toBeInstanceOf(Service);
    expect(service.id).toBe(1);
    expect(service.title).toBe('Test Service');
  });

  it('should convert service to DTO', () => {
    const service = new Service(1, 'Test Service', 'Test Description', 'https://test.com', 'image.jpg');
    const dto = service.toDTO();
    
    expect(dto).toEqual({
      id: 1,
      title: 'Test Service',
      description: 'Test Description',
      link: 'https://test.com',
      imageUrl: 'image.jpg'
    });
  });

  it('should validate service correctly', () => {
    const validService = new Service(1, 'Test', 'Description', 'https://test.com');
    expect(validService.validate()).toBe(true);
    
    const invalidTitle = new Service(1, '', 'Description', 'https://test.com');
    expect(() => invalidTitle.validate()).toThrow('El título es obligatorio');
    
    const invalidDescription = new Service(1, 'Test', '', 'https://test.com');
    expect(() => invalidDescription.validate()).toThrow('La descripción es obligatoria');
    
    const invalidLink = new Service(1, 'Test', 'Description', '');
    expect(() => invalidLink.validate()).toThrow('El enlace es obligatorio');
  });
});