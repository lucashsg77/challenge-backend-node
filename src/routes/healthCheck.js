const axios = require('axios');
const soap = require('soap');
const os = require('os');
const logger = require('../config/logger');

async function routes(fastify, options) {

  fastify.get('/', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });
  fastify.get('/detailed', async (request, reply) => {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      host: os.hostname(),
      services: {
        graphql: { status: 'unknown' },
        rest: { status: 'unknown' },
        soap: { status: 'unknown' }
      },
      memory: {
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB'
      }
    };

    try {
      await axios.post(
        'https://beta.pokeapi.co/graphql/v1beta',
        {
          query: `{ pokemon_v2_pokemon(limit: 1) { id name } }`
        },
        { timeout: 3000 }
      );
      health.services.graphql = { status: 'ok' };
    } catch (error) {
      health.services.graphql = { 
        status: 'error', 
        message: error.message 
      };
      health.status = 'degraded';
    }

    try {
      await axios.get('https://pokeapi.co/api/v2/pokemon/1', { timeout: 3000 });
      health.services.rest = { status: 'ok' };
    } catch (error) {
      health.services.rest = { 
        status: 'error', 
        message: error.message 
      };
      health.status = 'degraded';
    }

    try {
      const wsdlUrl = 'https://www.dataaccess.com/webservicesserver/numberconversion.wso?WSDL';
      await soap.createClientAsync(wsdlUrl);
      health.services.soap = { status: 'ok' };
    } catch (error) {
      health.services.soap = { 
        status: 'error', 
        message: error.message 
      };
      health.status = 'degraded';
    }

    logger.info({ 
      event: 'health_check',
      status: health.status,
      services: {
        graphql: health.services.graphql.status,
        rest: health.services.rest.status,
        soap: health.services.soap.status
      }
    });

    return health;
  });
}

module.exports = routes;