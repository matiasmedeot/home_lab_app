import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export class Database {
  constructor(dataDir = '/data') {
    this.dataDir = dataDir;
    this.dbInstance = null;
    this.dbPath = path.join(this.dataDir, 'homelab.db');
  }

  async connect() {
    try {
      console.log(`Intentando abrir base de datos en: ${this.dbPath}`);
      
      this.dbInstance = await open({
        filename: this.dbPath,
        driver: sqlite3.Database,
        mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE
      });

      await this._initTables();
      console.log('Base de datos inicializada correctamente');
      return this.dbInstance;
    } catch (error) {
      console.error('Error conectando a la base de datos:', error);
      throw error;
    }
  }

  async _initTables() {
    await this.dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        link TEXT NOT NULL,
        imageUrl TEXT
      )
    `);
  }

  async getDb() {
    if (!this.dbInstance) {
      await this.connect();
    }
    return this.dbInstance;
  }
}