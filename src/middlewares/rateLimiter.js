const logger = require('../config/logger');

const setupRateLimiter = async (fastify) => {
  try {
    const rateLimitPlugin = require('@fastify/rate-limit');

    await fastify.register(rateLimitPlugin, {
      max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
      timeWindow: process.env.RATE_LIMIT_WINDOW || '1 minute',

      keyGenerator: (req) => {
        return req.headers['x-forwarded-for'] || req.ip;
      },
      
      errorResponseBuilder: (req, context) => {
        logger.warn({ 
          ip: req.ip, 
          path: req.url, 
          headers: req.headers,
          exceeded: true 
        }, 'Rate limit exceeded');
        
        return {
          code: 429,
          error: 'Too Many Requests',
          message: `Rate limit exceeded, retry in ${context.after}`,
          date: Date.now(),
          expiresIn: context.after
        };
      }
    });

    logger.info('Rate limiter plugin registered successfully');
  } catch (error) {
    logger.error({ err: error }, 'Failed to register rate limiter plugin - continuing without rate limiting');
  }
};

module.exports = setupRateLimiter;