async function uniqueArrayController(request, reply) {
  const { array } = request.body;
  
  request.log.info({ 
    arrayLength: array.length 
  }, 'Processing unique array request');
  
  const seen = {};
  const uniqueArray = [];
  
  for (let i = 0; i < array.length; i++) {
    const num = array[i];
    if (seen[num] === undefined) {
      seen[num] = true;
      uniqueArray.push(num);
    }
  }
  
  uniqueArray.sort((a, b) => a - b);
  
  request.log.info({ 
    originalLength: array.length,
    uniqueLength: uniqueArray.length
  }, 'Unique array processed successfully');
  
  return { uniqueArray };
}

module.exports = uniqueArrayController;