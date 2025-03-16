const build = require('../src/app');
const axios = require('axios');
const soap = require('soap');

jest.mock('axios');
jest.mock('soap');

describe('Health Check Endpoints', () => {
  let app;

  beforeAll(async () => {
    app = await build({ swagger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Basic Health Check', () => {
    test('should return ok status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.body);
      expect(payload).toHaveProperty('status', 'ok');
      expect(payload).toHaveProperty('timestamp');
    });
  });

  describe('Detailed Health Check', () => {
    test('should return detailed health information when all services are healthy', async () => {
      axios.post.mockResolvedValueOnce({});
      axios.get.mockResolvedValueOnce({});
      soap.createClientAsync.mockResolvedValueOnce({});

      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed'
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.body);

      expect(payload).toHaveProperty('status', 'ok');
      expect(payload).toHaveProperty('timestamp');
      expect(payload).toHaveProperty('uptime');
      expect(payload).toHaveProperty('host');

      expect(payload.services.graphql.status).toBe('ok');
      expect(payload.services.rest.status).toBe('ok');
      expect(payload.services.soap.status).toBe('ok');

      expect(payload).toHaveProperty('memory.rss');
      expect(payload).toHaveProperty('memory.heapTotal');
      expect(payload).toHaveProperty('memory.heapUsed');
    });

    test('should report degraded status when some services fail', async () => {
      axios.post.mockResolvedValueOnce({});
      axios.get.mockRejectedValueOnce(new Error('Service unavailable'));
      soap.createClientAsync.mockResolvedValueOnce({});

      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed'
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.body);

      expect(payload).toHaveProperty('status', 'degraded');

      expect(payload.services.graphql.status).toBe('ok');
      expect(payload.services.rest.status).toBe('error');
      expect(payload.services.soap.status).toBe('ok');
    });

    test('should handle case when all services are down', async () => {
      axios.post.mockRejectedValueOnce(new Error('GraphQL service down'));
      axios.get.mockRejectedValueOnce(new Error('REST service down'));
      soap.createClientAsync.mockRejectedValueOnce(new Error('SOAP service down'));

      const response = await app.inject({
        method: 'GET',
        url: '/health/detailed'
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.body);

      expect(payload).toHaveProperty('status', 'degraded');

      expect(payload.services.graphql.status).toBe('error');
      expect(payload.services.rest.status).toBe('error');
      expect(payload.services.soap.status).toBe('error');

      expect(payload).toHaveProperty('memory.rss');
    });
  });
});