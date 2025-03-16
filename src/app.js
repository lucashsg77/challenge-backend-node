const fastify = require('fastify');
const uniqueArray = require('./routes/uniqueArray');
const externalData = require('./routes/externalData');
const healthCheck = require('./routes/healthCheck');
const logger = require('./config/logger');
const setupRateLimiter = require('./middlewares/rateLimiter');
const setupSwagger = require('./config/swagger');
const requestIdPlugin = require('./middlewares/requestId');

async function build(opts = {}) {
  const app = fastify({ 
    ...opts,
    logger: {
      level: opts.logger?.level || 'info',
      transport: process.env.NODE_ENV !== 'test'
        ? { target: 'pino-pretty' }
        : undefined
    }
  });

  try {
    await setupRateLimiter(app);
    await app.register(requestIdPlugin);

    const enableSwagger = process.env.NODE_ENV !== 'test' && opts.swagger !== false;

    if (enableSwagger) {
      await app.register(async function(instance) {
        const schemas = await setupSwagger(instance);
        instance.register(uniqueArray, { 
          prefix: '/unique-array',
          schema: schemas.uniqueArraySchema
        });
        instance.register(externalData, { 
          prefix: '/external-data',
          schema: schemas.externalDataSchema
        });
        instance.register(healthCheck, {
          prefix: '/health',
          schemas: {
            healthCheck: schemas.healthCheckSchema,
            detailedHealthCheck: schemas.detailedHealthCheckSchema
          }
        });
      });
    } else {
      app.get('/', async (request, reply) => {
        return { hello: 'world' };
      });
      app.register(uniqueArray, { 
        prefix: '/unique-array',
        schema: {}
      });
      app.register(externalData, { 
        prefix: '/external-data', 
        schema: {}
      });
      app.register(healthCheck, {
        prefix: '/health',
        schemas: {
          healthCheck: {},
          detailedHealthCheck: {}
        }
      });
    }

    app.setErrorHandler((error, request, reply) => {
      request.log.error({ err: error }, 'Error occurred');
      if (error.validation) {
        reply.status(400).send({ 
          error: 'Validation Error', 
          details: error.validation 
        });
        return;
      }
      const statusCode = error.statusCode || 500;
      const message = statusCode === 500 
        ? 'Internal Server Error'
        : error.message;
      reply.status(statusCode).send({ error: message });
    });
  } catch (error) {
    logger.error({ err: error }, 'Error during application setup');
    throw error;
  }

  return app;
}

module.exports = build;
