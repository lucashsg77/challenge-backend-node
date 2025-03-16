const build = require('./app.js');
const logger = require('./config/logger');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

async function start() {
  try {
    const server = await build({
      logger: {
        level: process.env.LOG_LEVEL || (NODE_ENV === 'production' ? 'info' : 'debug')
      },
      disableRequestLogging: true
    });

    const closeGracefully = async (signal) => {
      logger.info(`Received signal to terminate: ${signal}`);

      try {
        await server.close();
        logger.info('Server closed successfully');
        process.exit(0);
      } catch (error) {
        logger.error({ err: error }, 'Error closing the server');
        process.exit(1);
      }
    };

    process.on('SIGINT', closeGracefully);
    process.on('SIGTERM', closeGracefully);
    process.on('uncaughtException', (error) => {
      logger.fatal({ err: error }, 'Uncaught exception');
      closeGracefully('uncaughtException');
    });
    process.on('unhandledRejection', (reason, promise) => {
      logger.fatal({ err: reason }, 'Unhandled rejection');
      closeGracefully('unhandledRejection');
    });

    server.listen({ port: PORT, host: HOST });
    
    logger.info({
      env: NODE_ENV,
      address: server.server.address()
    }, 'Server started successfully');
    
    if (NODE_ENV === 'development') {
      logger.info(`API Documentation: http://localhost:${PORT}/documentation`);
      logger.info(`Health Check: http://localhost:${PORT}/health`);
    }

    return server;
  } catch (err) {
    logger.error({ err }, 'Error starting server');
    process.exit(1);
  }
}

start();