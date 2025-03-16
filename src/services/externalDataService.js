const graphqlService = require('./externalDataGraphQLService');
const restService = require('./externalDataRestService');
const soapService = require('./externalDataSoapService');
const logger = require('../config/logger');

async function fetchExternalData(source = 'graphql', params = {}, requestId = 'unknown') {
  const log = logger.child({ 
    service: 'external-data-service',
    source,
    requestId
  });

  log.info(`Using ${source} strategy to fetch external data`);

  try {
    let result;
    
    if (source === 'graphql') {
      result = await graphqlService.fetchData(params, requestId);
    } else if (source === 'rest') {
      result = await restService.fetchData(params, requestId);
    } else if (source === 'soap') {
      result = await soapService.fetchData(params, requestId);
    } else {
      log.error(`Invalid source specified: ${source}`);
      throw new Error('Invalid external data source specified');
    }
    
    log.info('External data fetched successfully');
    return result;
  } catch (error) {
    log.error({ 
      err: error,
      stack: error.stack
    }, `Error fetching data from ${source} service`);
    throw error;
  }
}

module.exports = { fetchExternalData };