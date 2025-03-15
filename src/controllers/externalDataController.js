const { fetchExternalData } = require('../services/externalDataService');

async function externalDataController(request, reply) {
  try {
    const source = request.query.source || 'graphql';

    const params = {
      pokemon: request.query.pokemon,
      number: request.query.number,
    };

    if ((source === 'graphql' || source === 'rest') && !params.pokemon) {
      reply.code(400);
      return { error: 'Bad Request: Missing "pokemon" parameter.' };
    }
    if (source === 'soap' && !params.number) {
      reply.code(400);
      return { error: 'Bad Request: Missing "number" parameter.' };
    }

    const data = await fetchExternalData(source, params);
    return data;
  } catch (error) {
    if (error.response) {
      const status = error.response.status;

      if (status === 400) {
        reply.code(400);
        return { error: 'Bad Request: Invalid input provided.' };
      }
      if (status === 401) {
        reply.code(401);
        return { error: 'Unauthorized: API key missing or invalid.' };
      }
      if (status === 403) {
        reply.code(403);
        return { error: 'Forbidden: You do not have access to this resource.' };
      }
      if (status === 404) {
        reply.code(404);
        return { error: 'Not Found: No matching data found for your query.' };
      }
      if (status === 429) {
        reply.code(429);
        return { error: 'Too Many Requests: API rate limit exceeded. Try again later.' };
      }
      if (status === 503) {
        reply.code(503);
        return { error: 'Service Unavailable: External API is down.' };
      }

      // Fallback for other external possible API errors
      reply.code(status);
      return { error: error.response.statusText || 'External service error' };
    } 
    else if (error.code === 'ECONNABORTED') {
      reply.code(504);
      return { error: 'Timeout accessing the external service' };
    } 
    else {
      console.error('Unexpected Error:', error);
      reply.code(500);
      return { error: 'Internal server error' };
    }
  }
}

module.exports = externalDataController;

module.exports = externalDataController;
