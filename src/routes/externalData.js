const externalDataController = require('../controllers/externalDataController');

async function routes(fastify, options) {
  fastify.get('/', externalDataController);
}

module.exports = routes;
