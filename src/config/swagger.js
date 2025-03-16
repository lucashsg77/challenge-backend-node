const fastifySwagger = require('@fastify/swagger');
const fastifySwaggerUi = require('@fastify/swagger-ui');

const setupSwagger = async (fastify) => {
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Backend Challenge API',
        description: 'API for Backend Challenge',
        version: '1.0.0'
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server'
        }
      ],
      components: {
        schemas: {
          UniqueArrayRequest: {
            type: 'object',
            required: ['array'],
            properties: {
              array: {
                type: 'array',
                items: { type: 'number' },
                minItems: 1,
                example: [1, 2, 3, 4, 5, 6, 2, 5, 4, 3, 9, 1, 4, 8, 2, 6, 5, 4]
              }
            }
          },
          UniqueArrayResponse: {
            type: 'object',
            properties: {
              uniqueArray: {
                type: 'array',
                items: { type: 'number' },
                example: [1, 2, 3, 4, 5, 6, 8, 9]
              }
            }
          },
          ExternalDataParams: {
            type: 'object',
            properties: {
              source: {
                type: 'string',
                enum: ['graphql', 'rest', 'soap'],
                default: 'graphql',
                description: 'Source of external data'
              },
              pokemon: {
                type: 'string',
                description: 'Pokemon name (for GraphQL and REST)',
                default: 'pikachu'
              },
              number: {
                type: 'integer',
                description: 'Number to convert to words (for SOAP)',
                default: 123
              }
            }
          },
          ExternalDataResponse: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  types: { 
                    type: 'array',
                    items: { type: 'string' }
                  }
                },
                example: {
                  id: "25",
                  name: "pikachu",
                  types: ["electric"]
                }
              },
              {
                type: 'object',
                properties: {
                  result: { type: 'string' }
                },
                example: {
                  result: "one hundred twenty three"
                }
              }
            ]
          },
          ErrorResponse: {
            type: 'object',
            properties: {
              error: { type: 'string' }
            },
            example: {
              error: 'Bad Request: Invalid input provided.'
            }
          },
          HealthCheckResponse: {
            type: 'object',
            properties: {
              status: { 
                type: 'string',
                enum: ['ok', 'degraded', 'error']
              },
              timestamp: { type: 'string' }
            },
            example: {
              status: 'ok',
              timestamp: '2025-03-15T12:00:00.000Z'
            }
          },
          DetailedHealthCheckResponse: {
            type: 'object',
            properties: {
              status: { 
                type: 'string',
                enum: ['ok', 'degraded', 'error']
              },
              timestamp: { type: 'string' },
              uptime: { type: 'number' },
              host: { type: 'string' },
              services: {
                type: 'object',
                properties: {
                  graphql: {
                    type: 'object',
                    properties: {
                      status: { 
                        type: 'string',
                        enum: ['ok', 'error', 'unknown']
                      },
                      message: { type: 'string' }
                    }
                  },
                  rest: {
                    type: 'object',
                    properties: {
                      status: { 
                        type: 'string',
                        enum: ['ok', 'error', 'unknown']
                      },
                      message: { type: 'string' }
                    }
                  },
                  soap: {
                    type: 'object',
                    properties: {
                      status: { 
                        type: 'string',
                        enum: ['ok', 'error', 'unknown']
                      },
                      message: { type: 'string' }
                    }
                  }
                }
              },
              memory: {
                type: 'object',
                properties: {
                  rss: { type: 'string' },
                  heapTotal: { type: 'string' },
                  heapUsed: { type: 'string' }
                }
              }
            }
          }
        }
      },
      tags: [
        { name: 'Array Operations', description: 'Endpoints for array operations' },
        { name: 'External Data', description: 'Endpoints for external data' },
        { name: 'Health', description: 'Health check endpoints' }
      ]
    }
  });

  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false
    }
  });

  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      description: 'Root endpoint',
      response: {
        200: {
          type: 'object',
          properties: {
            hello: { type: 'string' }
          }
        }
      }
    },
    handler: async (request, reply) => {
      return { hello: 'world' };
    }
  });

  const uniqueArraySchema = {
    description: 'Process an array and return unique values in sorted order',
    tags: ['Array Operations'],
    body: {
      $ref: '#/components/schemas/UniqueArrayRequest'
    },
    response: {
      200: {
        $ref: '#/components/schemas/UniqueArrayResponse'
      },
      400: {
        $ref: '#/components/schemas/ErrorResponse'
      }
    }
  };

  const externalDataSchema = {
    description: 'Fetch and process external data',
    tags: ['External Data'],
    querystring: {
      $ref: '#/components/schemas/ExternalDataParams'
    },
    response: {
      200: {
        $ref: '#/components/schemas/ExternalDataResponse'
      },
      400: {
        $ref: '#/components/schemas/ErrorResponse'
      },
      404: {
        $ref: '#/components/schemas/ErrorResponse'
      },
      429: {
        $ref: '#/components/schemas/ErrorResponse'
      },
      500: {
        $ref: '#/components/schemas/ErrorResponse'
      },
      504: {
        $ref: '#/components/schemas/ErrorResponse'
      }
    }
  };

  const healthCheckSchema = {
    description: 'Simple health check',
    tags: ['Health'],
    response: {
      200: {
        $ref: '#/components/schemas/HealthCheckResponse'
      }
    }
  };

  const detailedHealthCheckSchema = {
    description: 'Detailed health check with service dependencies',
    tags: ['Health'],
    response: {
      200: {
        $ref: '#/components/schemas/DetailedHealthCheckResponse'
      }
    }
  };


  return {
    uniqueArraySchema,
    externalDataSchema,
    healthCheckSchema,
    detailedHealthCheckSchema,
  };
};

module.exports = setupSwagger;