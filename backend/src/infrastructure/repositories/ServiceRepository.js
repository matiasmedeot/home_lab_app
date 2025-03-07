import { IServiceRepository } from './IServiceRepository.js';
import { Service } from '../../domain/models/Service.js';

export class ServiceRepository extends IServiceRepository {
  constructor(database) {
    super();
    this.database = database;
    this.ServiceModel = database.getModels().Service;
  }

  async findAll() {
    try {
      const services = await this.ServiceModel.findAll();
      return services.map(service => this._mapToEntity(service));
    } catch (error) {
      console.error('Error al obtener servicios:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const service = await this.ServiceModel.findByPk(id);
      return service ? this._mapToEntity(service) : null;
    } catch (error) {
      console.error(`Error al obtener servicio con ID ${id}:`, error);
      throw error;
    }
  }

  async create(service) {
    try {
      service.validate();
      const createdService = await this.ServiceModel.create({
        title: service.title,
        description: service.description,
        link: service.link,
        imageUrl: service.imageUrl
      });
      
      return this._mapToEntity(createdService);
    } catch (error) {
      console.error('Error al crear servicio:', error);
      throw error;
    }
  }

  async update(id, service) {
    try {
      service.validate();
      const [updated] = await this.ServiceModel.update(
        {
          title: service.title,
          description: service.description,
          link: service.link,
          imageUrl: service.imageUrl
        },
        { where: { id } }
      );
      
      if (updated === 0) {
        throw new Error(`Servicio con ID ${id} no encontrado`);
      }
      
      const updatedService = await this.ServiceModel.findByPk(id);
      return this._mapToEntity(updatedService);
    } catch (error) {
      console.error(`Error al actualizar servicio con ID ${id}:`, error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const deleted = await this.ServiceModel.destroy({ where: { id } });
      if (deleted === 0) {
        throw new Error(`Servicio con ID ${id} no encontrado`);
      }
      return true;
    } catch (error) {
      console.error(`Error al eliminar servicio con ID ${id}:`, error);
      throw error;
    }
  }

  // Método privado para mapear de modelo de la base de datos a entidad de dominio
  _mapToEntity(model) {
    return new Service(
      model.id,
      model.title,
      model.description,
      model.link,
      model.imageUrl
    );
  }
}