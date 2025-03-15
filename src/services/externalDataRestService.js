const axios = require('axios');

let externalDataCache = null;
let externalDataCacheTimestamp = null;
const CACHE_TTL = 60 * 1000;

async function fetchData(params = {}) {
  const now = Date.now();
  if (externalDataCache && (now - externalDataCacheTimestamp) < CACHE_TTL) {
    return externalDataCache;
  }

  const pokemonName = params.pokemon || "pikachu";
  const restEndpoint = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
  const response = await axios.get(restEndpoint, { timeout: 5000 });
  const data = response.data;

  const processedData = {
    id: data.id,
    name: data.name,
    types: data.types.map(t => t.type.name)
  };

  externalDataCache = processedData;
  externalDataCacheTimestamp = now;
  
  return processedData;
}

module.exports = { fetchData };
