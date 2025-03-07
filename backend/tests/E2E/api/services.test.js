import request from 'supertest';
import { jest } from '@jest/globals';
import startServer from '../../../src/server.js';
import { createTestDatabase, clearDatabase, closeDatabase } from '../config/test-db.js';

// Explicitly define Jest globals if they're not being recognized
global.describe = global.describe || jest.fn();
global.beforeAll = global.beforeAll || jest.fn();
global.beforeEach = global.beforeEach || jest.fn();
global.afterAll = global.afterAll || jest.fn();
global.test = global.test || jest.fn();
global.expect = global.expect || jest.fn();

describe('Services API E2E Tests', () => {
  let app;
  let database;
  let serviceId;

  beforeAll(async () => {
    database = await createTestDatabase();
    app = await startServer({ database, isTest: true });
  });

  beforeEach(async () => {
    await clearDatabase(database);
  });

  afterAll(async () => {
    await closeDatabase(database);
  });

  const testService = {
    title: 'Test Service',
    description: 'Service Description for Testing',
    link: 'https://test-service.com',
    imageUrl: 'test.jpg'
  };

  test('POST /api/services - should create a new service', async () => {
    const response = await request(app)
      .post('/api/services')
      .send(testService)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(testService.title);
    serviceId = response.body.id;
  });

  test('GET /api/services - should return all services', async () => {
    // First create a service
    const createResponse = await request(app)
      .post('/api/services')
      .send(testService);
    
    serviceId = createResponse.body.id;

    // Then get all services
    const response = await request(app)
      .get('/api/services')
      .expect(200);

    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBe(1);
    expect(response.body[0].title).toBe(testService.title);
  });

  test('GET /api/services/:id - should return a specific service', async () => {
    // First create a service
    const createResponse = await request(app)
      .post('/api/services')
      .send(testService);
    
    serviceId = createResponse.body.id;

    // Then get the specific service
    const response = await request(app)
      .get(`/api/services/${serviceId}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', serviceId);
    expect(response.body.title).toBe(testService.title);
  });

  test('GET /api/services/:id - should return 404 for non-existent service', async () => {
    await request(app)
      .get('/api/services/999')
      .expect(404);
  });

  test('PUT /api/services/:id - should update a service', async () => {
    // First create a service
    const createResponse = await request(app)
      .post('/api/services')
      .send(testService);
    
    serviceId = createResponse.body.id;

    // Then update it
    const updatedData = {
      title: 'Updated Service',
      description: 'Updated Description',
      link: 'https://updated-service.com',
      imageUrl: 'updated.jpg'
    };

    const response = await request(app)
      .put(`/api/services/${serviceId}`)
      .send(updatedData)
      .expect(200);

    expect(response.body).toHaveProperty('id', serviceId);
    expect(response.body.title).toBe(updatedData.title);
  });

  test('DELETE /api/services/:id - should delete a service', async () => {
    // First create a service
    const createResponse = await request(app)
      .post('/api/services')
      .send(testService);
    
    serviceId = createResponse.body.id;

    // Then delete it
    await request(app)
      .delete(`/api/services/${serviceId}`)
      .expect(200);

    // Verify it's deleted
    await request(app)
      .get(`/api/services/${serviceId}`)
      .expect(404);
  });
});