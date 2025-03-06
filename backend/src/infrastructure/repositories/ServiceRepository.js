import { IServiceRepository } from './IServiceRepository.js';
import { Service } from '../../domain/models/Service.js';

export class ServiceRepository extends IServiceRepository {
  constructor(database) {
    super();
    this.database = database;
  }

  async findAll() {
    try {
      const db = await this.database.getDb();
      const services = await db.all('SELECT * FROM services');
      return services.map(service => Service.fromDTO(service));
    } catch (error) {
      console.error('Error al obtener servicios:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const db = await this.database.getDb();
      const service = await db.get('SELECT * FROM services WHERE id = ?', id);
      return service ? Service.fromDTO(service) : null;
    } catch (error) {
      console.error(`Error al obtener servicio con ID ${id}:`, error);
      throw error;
    }
  }

  async create(service) {
    try {
      service.validate();
      const db = await this.database.getDb();
      const result = await db.run(
        'INSERT INTO services (title, description, link, imageUrl) VALUES (?, ?, ?, ?)',
        [service.title, service.description, service.link, service.imageUrl]
      );
      
      service.id = result.lastID;
      return service;
    } catch (error) {
      console.error('Error al crear servicio:', error);
      throw error;
    }
  }

  async update(id, service) {
    try {
      service.validate();
      const db = await this.database.getDb();
      await db.run(
        'UPDATE services SET title = ?, description = ?, link = ?, imageUrl = ? WHERE id = ?',
        [service.title, service.description, service.link, service.imageUrl, id]
      );
      
      service.id = parseInt(id);
      return service;
    } catch (error) {
      console.error(`Error al actualizar servicio con ID ${id}:`, error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const db = await this.database.getDb();
      await db.run('DELETE FROM services WHERE id = ?', id);
      return true;
    } catch (error) {
      console.error(`Error al eliminar servicio con ID ${id}:`, error);
      throw error;
    }
  }
}