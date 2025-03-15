const soap = require('soap');

let externalDataCache = null;
let externalDataCacheTimestamp = null;
const CACHE_TTL = 60 * 1000;

async function fetchData(params = {}) {
  const now = Date.now();
  if (externalDataCache && (now - externalDataCacheTimestamp) < CACHE_TTL) {
    return externalDataCache;
  }

  const wsdlUrl = 'https://www.dataaccess.com/webservicesserver/numberconversion.wso?WSDL';
  const numberToConvert = params.number || 123;
  const args = { ubiNum: numberToConvert };

  try {
    const client = await soap.createClientAsync(wsdlUrl);
    const result = await client.NumberToWordsAsync(args);
    const processedData = {
      result: result[0].NumberToWordsResult
    };

    externalDataCache = processedData;
    externalDataCacheTimestamp = now;
    
    return processedData;
  } catch (error) {
    throw error;
  }
}

module.exports = { fetchData };
