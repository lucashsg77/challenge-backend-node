const soap = require('soap');
const logger = require('../config/logger');

const CACHE_TTL = 60 * 1000;
const cache = new Map();

async function fetchData(params = {}, requestId = 'unknown') {
  const now = Date.now();
  const numberToConvert = params.number || 123;
  const cacheKey = `num-${numberToConvert}`;
  
  const log = logger.child({ 
    service: 'soap', 
    number: numberToConvert,
    requestId
  });

  if (cache.has(cacheKey)) {
    const cachedEntry = cache.get(cacheKey);
    if (now - cachedEntry.timestamp < CACHE_TTL) {
      log.info('Cache hit for number conversion');
      return cachedEntry.data;
    }
    log.info('Cache expired for number conversion');
  } else {
    log.info('Cache miss for number conversion');
  }

  try {
    log.debug('Fetching number conversion from SOAP service');
    const wsdlUrl = 'https://www.dataaccess.com/webservicesserver/numberconversion.wso?WSDL';
    const args = { ubiNum: numberToConvert };

    const client = await soap.createClientAsync(wsdlUrl);

    if (client.addHttpHeader) {
      client.addHttpHeader('X-Request-ID', requestId);
    }
    
    const result = await client.NumberToWordsAsync(args);
    const processedData = {
      result: result[0].NumberToWordsResult
    };

    cache.set(cacheKey, { data: processedData, timestamp: now });
    
    log.info({
      result: processedData.result
    }, 'Successfully converted number to words');
    
    return processedData;
  } catch (error) {
    log.error({ 
      err: error
    }, 'Error converting number to words');
    
    throw error;
  }
}

module.exports = { fetchData };