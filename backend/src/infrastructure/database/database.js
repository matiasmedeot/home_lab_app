import { Sequelize } from 'sequelize';
import path from 'path';
import ServiceModel from './models/ServiceModel.js';

export class Database {
  constructor(dataDir = '/data', options = {}) {
    this.dataDir = dataDir;
    this.options = options;
    this.sequelize = null;
    this.models = {};
  }

  async connect() {
    try {
      const isTest = process.env.NODE_ENV === 'test';
      const storage = isTest ? ':memory:' : path.join(this.dataDir, 'homelab.db');
      
      console.log(`Conectando a la base de datos ${isTest ? 'en memoria' : `en: ${storage}`}`);
      
      // Crear instancia de Sequelize
      this.sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: storage,
        logging: false,
        ...this.options
      });
      
      // Inicializar modelos
      this.models.Service = ServiceModel.init(this.sequelize);
      
      // Sincronizar modelos con la base de datos
      await this.sequelize.sync();
      
      console.log('Base de datos inicializada correctamente');
      return this.sequelize;
    } catch (error) {
      console.error('Error conectando a la base de datos:', error);
      throw error;
    }
  }

  async close() {
    if (this.sequelize) {
      await this.sequelize.close();
    }
  }

  getModels() {
    return this.models;
  }

  async clearDatabase() {
    if (this.sequelize) {
      await this.sequelize.sync({ force: true });
    }
  }
}