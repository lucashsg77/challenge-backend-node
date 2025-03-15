module.exports = {
    body: {
        type: 'object',
        properties: {
            array: {
                type: 'array',
                minItems: 1,
                items: { type: 'number' },
            }
        },
        required: ['array'],
        additionalProperties: false,
    },
    response: {
        200: {
            type: 'object',
            properties: {
                uniqueArray: {
                    type: 'array',
                    items: { type: 'number' },
                }
            },
        },
    },
};