const { fetchExternalData } = require('../services/externalDataService');

async function externalDataController(request, reply) {
  try {
    const source = request.query.source || 'graphql';
    // Extract additional parameters:
    // For GraphQL/REST: 'pokemon' specifies which Pokémon to retrieve.
    // For SOAP: 'number' specifies which number to convert.
    const params = {
      pokemon: request.query.pokemon,
      number: request.query.number,
    };
    const data = await fetchExternalData(source, params);
    return data;
  } catch (error) {
    if (error.response) {
      reply.code(error.response.status);
      return { error: error.response.statusText || 'External service error' };
    } else if (error.code === 'ECONNABORTED') {
      reply.code(504);
      return { error: 'Timeout accessing the external service' };
    } else {
      reply.code(500);
      return { error: 'Internal server error' };
    }
  }
}

module.exports = externalDataController;
