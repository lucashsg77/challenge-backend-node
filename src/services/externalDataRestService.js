const axios = require('axios');
const logger = require('../config/logger');

const CACHE_TTL = 60 * 1000;
const cache = new Map();

async function fetchData(params = {}, requestId = 'unknown') {
  const now = Date.now();
  const pokemonName = params.pokemon || "pikachu";
  const log = logger.child({ 
    service: 'rest', 
    pokemon: pokemonName,
    requestId
  });

  if (cache.has(pokemonName)) {
    const cachedEntry = cache.get(pokemonName);
    if (now - cachedEntry.timestamp < CACHE_TTL) {
      log.info('Cache hit for pokemon data');
      return cachedEntry.data;
    }
    log.info('Cache expired for pokemon data');
  } else {
    log.info('Cache miss for pokemon data');
  }

  try {
    log.debug('Fetching pokemon data from REST API');
    const restEndpoint = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
    const response = await axios.get(
      restEndpoint, 
      { 
        timeout: 5000,
        headers: {
          'X-Request-ID': requestId
        }
      }
    );
    
    const data = response.data;

    const processedData = {
      id: data.id,
      name: data.name,
      types: data.types.map(t => t.type.name)
    };

    cache.set(pokemonName, { data: processedData, timestamp: now });
    
    log.info({
      pokemonId: processedData.id,
      types: processedData.types
    }, 'Successfully fetched pokemon data');
    
    return processedData;
  } catch (error) {
    log.error({ 
      err: error,
      response: error.response?.data
    }, 'Error fetching pokemon data');
    
    throw error;
  }
}

module.exports = { fetchData };