describe('External Data Endpoint - GraphQL Approach', () => {
  let app;
  let build;
  let axiosMock;

  beforeEach(async () => {
    jest.resetModules();
    jest.doMock('axios', () => ({
      post: jest.fn()
    }));
    axiosMock = require('axios');
    build = require('../src/app');
    app = build();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  test('should return external data processed correctly (GraphQL)', async () => {
    const mockData = {
      id: "25",
      name: "pikachu",
      pokemon_v2_pokemontypes: [
        { pokemon_v2_type: { name: "electric" } }
      ]
    };

    const expectedData = {
      id: "25",
      name: "pikachu",
      types: ["electric"]
    };

    axiosMock.post.mockResolvedValue({
      data: {
        data: {
          pokemon_v2_pokemon: [mockData]
        }
      }
    });

    const response = await app.inject({
      method: 'GET',
      url: '/external-data'
    });

    expect(response.statusCode).toBe(200);
    const json = JSON.parse(response.payload);
    expect(json).toEqual(expectedData);
  });

  test('should handle axios error with response gracefully (GraphQL)', async () => {
    axiosMock.post.mockRejectedValue({
      response: {
        status: 404,
        statusText: 'Not Found'
      }
    });

    const response = await app.inject({
      method: 'GET',
      url: '/external-data'
    });

    expect(response.statusCode).toBe(404);
    const json = JSON.parse(response.payload);
    expect(json.error).toBe('Not Found');
  });

  test('should handle timeout error gracefully (GraphQL)', async () => {
    axiosMock.post.mockRejectedValue({
      code: 'ECONNABORTED'
    });

    const response = await app.inject({
      method: 'GET',
      url: '/external-data'
    });

    expect(response.statusCode).toBe(504);
    const json = JSON.parse(response.payload);
    expect(json.error).toBe('Timeout accessing the external service');
  });

  test('should handle unknown error gracefully (GraphQL)', async () => {
    axiosMock.post.mockRejectedValue(new Error('Unknown error'));

    const response = await app.inject({
      method: 'GET',
      url: '/external-data'
    });

    expect(response.statusCode).toBe(500);
    const json = JSON.parse(response.payload);
    expect(json.error).toBe('Internal server error');
  });
});

describe('External Data Endpoint - REST Approach', () => {
  let app;
  let build;
  let axiosMock;

  beforeEach(async () => {
    jest.resetModules();
    jest.doMock('axios', () => ({
      get: jest.fn()
    }));
    axiosMock = require('axios');
    build = require('../src/app');
    app = build();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  test('should return external data processed correctly (REST)', async () => {
    const mockData = {
      id: 25,
      name: 'pikachu',
      types: ['electric']
    };
    axiosMock.get.mockResolvedValue({
      data: {
        id: mockData.id,
        name: mockData.name,
        types: [{ type: { name: 'electric' } }]
      }
    });

    const response = await app.inject({
      method: 'GET',
      url: '/external-data?source=rest'
    });

    expect(response.statusCode).toBe(200);
    const json = JSON.parse(response.payload);
    expect(json).toEqual(mockData);
  });

  test('should handle axios error with response gracefully (REST)', async () => {
    axiosMock.get.mockRejectedValue({
      response: {
        status: 404,
        statusText: 'Not Found'
      }
    });

    const response = await app.inject({
      method: 'GET',
      url: '/external-data?source=rest'
    });

    expect(response.statusCode).toBe(404);
    const json = JSON.parse(response.payload);
    expect(json.error).toBe('Not Found');
  });

  test('should handle timeout error gracefully (REST)', async () => {
    axiosMock.get.mockRejectedValue({
      code: 'ECONNABORTED'
    });

    const response = await app.inject({
      method: 'GET',
      url: '/external-data?source=rest'
    });

    expect(response.statusCode).toBe(504);
    const json = JSON.parse(response.payload);
    expect(json.error).toBe('Timeout accessing the external service');
  });

  test('should handle unknown error gracefully (REST)', async () => {
    axiosMock.get.mockRejectedValue(new Error('Unknown error'));

    const response = await app.inject({
      method: 'GET',
      url: '/external-data?source=rest'
    });

    expect(response.statusCode).toBe(500);
    const json = JSON.parse(response.payload);
    expect(json.error).toBe('Internal server error');
  });
});

describe('External Data Endpoint - SOAP Approach', () => {
  let app;
  let build;
  let soapMock;

  beforeEach(async () => {
    jest.resetModules();
    jest.doMock('soap', () => ({
      createClientAsync: jest.fn()
    }));
    soapMock = require('soap');
    build = require('../src/app');
    app = build();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  test('should return external data processed correctly (SOAP)', async () => {
    const expectedData = {
      result: "one hundred twenty three"
    };
    soapMock.createClientAsync.mockResolvedValue({
      NumberToWordsAsync: jest.fn().mockResolvedValue([{ NumberToWordsResult: expectedData.result }])
    });

    const response = await app.inject({
      method: 'GET',
      url: '/external-data?source=soap'
    });

    expect(response.statusCode).toBe(200);
    const json = JSON.parse(response.payload);
    expect(json).toEqual(expectedData);
  });

  test('should handle soap error with response gracefully (SOAP)', async () => {
    soapMock.createClientAsync.mockRejectedValue({
      response: {
        status: 404,
        statusText: 'Not Found'
      }
    });

    const response = await app.inject({
      method: 'GET',
      url: '/external-data?source=soap'
    });

    expect(response.statusCode).toBe(404);
    const json = JSON.parse(response.payload);
    expect(json.error).toBe('Not Found');
  });

  test('should handle timeout error gracefully (SOAP)', async () => {
    soapMock.createClientAsync.mockRejectedValue({
      code: 'ECONNABORTED'
    });

    const response = await app.inject({
      method: 'GET',
      url: '/external-data?source=soap'
    });

    expect(response.statusCode).toBe(504);
    const json = JSON.parse(response.payload);
    expect(json.error).toBe('Timeout accessing the external service');
  });

  test('should handle unknown error gracefully (SOAP)', async () => {
    soapMock.createClientAsync.mockRejectedValue(new Error('Unknown error'));

    const response = await app.inject({
      method: 'GET',
      url: '/external-data?source=soap'
    });

    expect(response.statusCode).toBe(500);
    const json = JSON.parse(response.payload);
    expect(json.error).toBe('Internal server error');
  });
});
