async function uniqueArrayController(request, reply) {
    const { array } = request.body;
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
    return { uniqueArray };
  }
  
  module.exports = uniqueArrayController;
  