const { fetchExternalData } = require('../services/externalDataService');

async function externalDataController(request, reply) {
  try {
    const source = request.query.source || 'graphql';
    
    request.log.info({ 
      source,
      queryParams: request.query
    }, 'External data request received');

    const params = {
      pokemon: request.query.pokemon || "pikachu",
      number: request.query.number || 123,
    };

    if ((source === 'graphql' || source === 'rest') && !params.pokemon) {
      request.log.warn('Missing pokemon parameter');
      reply.code(400);
      return { error: 'Bad Request: Missing "pokemon" parameter.' };
    }
    if (source === 'soap' && !params.number) {
      request.log.warn('Missing number parameter');
      reply.code(400);
      return { error: 'Bad Request: Missing "number" parameter.' };
    }

    const data = await fetchExternalData(source, params, request.id);
    
    request.log.info({
      source,
      dataSize: JSON.stringify(data).length
    }, 'External data fetched successfully');
    
    return data;
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      request.log.error({ 
        err: error,
        status,
        response: error.response.data
      }, 'External service responded with error');

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

      reply.code(status);
      return { error: error.response.statusText || 'External service error' };
    } 
    else if (error.code === 'ECONNABORTED') {
      request.log.error({ 
        err: error 
      }, 'External service timeout');
      
      reply.code(504);
      return { error: 'Timeout accessing the external service' };
    } 
    else {
      request.log.error({ 
        err: error 
      }, 'Unexpected error in external data controller');
      
      reply.code(500);
      return { error: 'Internal server error' };
    }
  }
}

module.exports = externalDataController;