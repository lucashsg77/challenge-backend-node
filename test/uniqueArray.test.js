const build = require('../src/app');

describe('Unique Array Endpoint', () => {
    let app;
    beforeAll(async () => {
        app = build();
    });
    afterAll(async () => {
        await app.close();
    });
    test('Should return a single sorted array', async () => {
        const payload = { array: [5, 1, 3, 2] };
        const response = await app.inject({
            method: 'POST',
            url: '/unique-array',
            payload
        });
        expect(response.statusCode).toBe(200);
        const json = JSON.parse(response.payload);
        expect(json.uniqueArray).toEqual([1, 2, 3, 5]);
    });
    test('Should return a 400 for an empty array', async () => {
        const payload = { array: [] };
        const response = await app.inject({
            method: 'POST',
            url: '/unique-array',
            payload
        });
        expect(response.statusCode).toBe(400);
    });
});
