import { Database } from '../../../src/infrastructure/database/database.js';

// Crea una instancia de base de datos específica para tests
export const createTestDatabase = async () => {
  process.env.NODE_ENV = 'test';
  const database = new Database();
  await database.connect();
  return database;
};

// Limpia la base de datos para pruebas aisladas
export const clearDatabase = async (database) => {
  await database.clearDatabase();
};

// Cierra la conexión a la base de datos
export const closeDatabase = async (database) => {
  await database.close();
};