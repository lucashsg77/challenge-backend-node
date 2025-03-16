const axios = require('axios');
const logger = require('../config/logger');

const CACHE_TTL = 60 * 1000;
const cache = new Map();

async function fetchData(params = {}, requestId = 'unknown') {
  const now = Date.now();
  const pokemonName = params.pokemon || "pikachu";
  const log = logger.child({ 
    service: 'graphql', 
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

  const graphqlEndpoint = 'https://beta.pokeapi.co/graphql/v1beta';
  const query = `
    query getPokemon($name: String!) {
      pokemon_v2_pokemon(where: { name: { _eq: $name } }) {
        id
        name
        pokemon_v2_pokemontypes {
          pokemon_v2_type {
            name
          }
        }
      }
    }
  `;

  try {
    log.debug('Fetching pokemon data from GraphQL API');
    const response = await axios.post(
      graphqlEndpoint,
      {
        query,
        variables: { name: pokemonName },
        operationName: "getPokemon"
      },
      { 
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId
        }
      }
    );

    const pokemons = response.data.data.pokemon_v2_pokemon;
    if (!pokemons || pokemons.length === 0) {
      log.warn('Pokemon not found');
      throw new Error("Pokemon not found");
    }

    const data = pokemons[0];
    const processedData = {
      id: data.id,
      name: data.name,
      types: data.pokemon_v2_pokemontypes.map(pt => pt.pokemon_v2_type.name)
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