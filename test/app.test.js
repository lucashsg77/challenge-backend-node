const build = require('../src/app');

describe('App Root Endpoint', () => {
  let app;

  beforeAll(async () => {
    app = await build({ swagger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('should return hello world on GET /', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/'
    });

    expect(response.statusCode).toBe(200);
    const payload = JSON.parse(response.body);
    expect(payload).toEqual({ hello: 'world' });
  });
});
