import { Service } from '../../domain/models/Service.js';

export class ServiceUseCases {
    constructor(serviceRepository) {
      this.serviceRepository = serviceRepository;
    }
  
    async getAllServices() {
      return await this.serviceRepository.findAll();
    }
  
    async getServiceById(id) {
      return await this.serviceRepository.findById(id);
    }
  
    async createService(serviceData) {
      const service = Service.fromDTO(serviceData);
      return await this.serviceRepository.create(service);
    }
  
    async updateService(id, serviceData) {
      const service = Service.fromDTO({ ...serviceData, id });
      return await this.serviceRepository.update(id, service);
    }
  
    async deleteService(id) {
      return await this.serviceRepository.delete(id);
    }
  }