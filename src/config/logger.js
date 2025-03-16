const pino = require('pino');

const logLevel = process.env.LOG_LEVEL || 'info';
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

const logger = pino({
  level: logLevel,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,

  mixin(mergeObject, level) {
    return { 
      env: process.env.NODE_ENV || 'development',
      service: 'backend-challenge'
    };
  },

  transport: (!isProduction && !isTest)
    ? {
        target: 'pino-pretty', 
        options: { 
          colorize: true,
          translateTime: 'SYS:standard'
        }
      } 
    : undefined
});

logger.info({
  logLevel,
  environment: isProduction ? 'production' : 'development'
}, 'Logger initialized');

module.exports = logger;
