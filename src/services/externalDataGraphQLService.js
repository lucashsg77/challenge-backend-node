const axios = require('axios');

const CACHE_TTL = 60 * 1000;
const cache = new Map();

async function fetchData(params = {}) {
  const now = Date.now();
  const pokemonName = params.pokemon || "pikachu";

  if (cache.has(pokemonName)) {
    const cachedEntry = cache.get(pokemonName);
    if (now - cachedEntry.timestamp < CACHE_TTL) {
      return cachedEntry.data;
    }
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

  const response = await axios.post(
    graphqlEndpoint,
    {
      query,
      variables: { name: pokemonName },
      operationName: "getPokemon"
    },
    { timeout: 5000 }
  );

  const pokemons = response.data.data.pokemon_v2_pokemon;
  if (!pokemons || pokemons.length === 0) {
    throw new Error("Pokemon not found");
  }

  const data = pokemons[0];
  const processedData = {
    id: data.id,
    name: data.name,
    types: data.pokemon_v2_pokemontypes.map(pt => pt.pokemon_v2_type.name)
  };

  cache.set(pokemonName, { data: processedData, timestamp: now });
  
  return processedData;
}

module.exports = { fetchData };
