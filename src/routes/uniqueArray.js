const uniqueArrayController = require('../controllers/uniqueArrayController');
const uniqueArrayValidator = require('../validators/uniqueArrayValidator');

async function routes(fastify, options) {
  fastify.post('/', {schema: uniqueArrayValidator}, uniqueArrayController);
    
}

module.exports = routes;