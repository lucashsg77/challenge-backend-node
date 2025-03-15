const fastify = require('fastify')
const uniqueArray = require('./routes/uniqueArray')
const externalData = require('./routes/externalData')

function build(opts={}) {
  const app = fastify(opts)
  app.get('/', async function (request, reply) {
    return { hello: 'world' }
  })
  app.register(uniqueArray, { prefix: '/unique-array' })
  app.register(externalData, { prefix: '/external-data' })
  return app
}

module.exports = build