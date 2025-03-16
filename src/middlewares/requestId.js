const { v4: uuidv4 } = require('uuid');
const logger = require('../config/logger');

const requestIdPlugin = async (fastify, options) => {
  fastify.addHook('onRequest', (request, reply, done) => {
    const requestId = request.headers['x-request-id'] || uuidv4();

    request.id = requestId;

    reply.header('x-request-id', requestId);

    request.log = logger.child({ 
      requestId, 
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers['user-agent']
    });
    
    request.log.info('Request received');
    
    done();
  });

  fastify.addHook('onResponse', (request, reply, done) => {
    request.log.info({
      statusCode: reply.statusCode,
      responseTime: reply.getResponseTime()
    }, 'Request completed');
    
    done();
  });

  fastify.addHook('onError', (request, reply, error, done) => {
    request.log.error({
      err: {
        message: error.message,
        stack: error.stack,
        type: error.constructor.name
      }
    }, 'Request error');
    
    done();
  });
};

module.exports = requestIdPlugin;