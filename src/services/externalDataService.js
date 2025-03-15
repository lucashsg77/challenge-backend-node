const graphqlService = require('./externalDataGraphQLService');
const restService = require('./externalDataRestService');
const soapService = require('./externalDataSoapService');

async function fetchExternalData(source = 'graphql', params = {}) {
  if (source === 'graphql') {
    return await graphqlService.fetchData(params);
  } else if (source === 'rest') {
    return await restService.fetchData(params);
  } else if (source === 'soap') {
    return await soapService.fetchData(params);
  } else {
    throw new Error('Invalid external data source specified');
  }
}

module.exports = { fetchExternalData };
