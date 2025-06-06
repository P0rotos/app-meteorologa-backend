const request = require('supertest');
const express = require('express');
require('dotenv').config();
const weatherRouter = require('../routes/weather');

const app = express();
app.use(express.json());
app.use('/weather', weatherRouter);

describe('Weather Routes', () => {
    describe('GET /weather/hourly', () => {
        it('should return hourly weather data', async () => {
            const response = await request(app)
                .get('/weather/hourly')
                .send({ lat: 40.7128, lon: -74.0060 });

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
            expect(response.body.length).toBeLessThanOrEqual(7);
        });

        it('should return 400 if latitude or longitude is missing', async () => {
            const response = await request(app)
                .get('/weather/hourly')
                .send({ lat: 40.7128 });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Latitude and longitude are required');
        });
    });

    describe('GET /weather/daily', () => {
        it('should return daily weather data', async () => {
            const response = await request(app)
                .get('/weather/daily')
                .send({ lat: 40.7128, lon: -74.0060 });

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
        });

        it('should return 400 if latitude or longitude is missing', async () => {
            const response = await request(app)
                .get('/weather/daily')
                .send({ lon: -74.0060 });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Latitude and longitude are required');
        });
    });

    describe('GET /weather/cities', () => {
        it('should return cities matching the query', async () => {
            const response = await request(app)
                .get('/weather/cities')
                .send({ city: 'New York' });

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
        });

        it('should return 400 if city is missing', async () => {
            const response = await request(app)
                .get('/weather/cities')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'City is required');
        });
    });

    describe('GET /weather/cords', () => {
        it('should return coordinates for the city', async () => {
            const response = await request(app)
                .get('/weather/cords')
                .send({ city: 'New York' });

            expect(response.status).toBe(200);
            expect(response.body).toBeInstanceOf(Array);
        });

        it('should return 400 if city is missing', async () => {
            const response = await request(app)
                .get('/weather/cords')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'City is required');
        });
    });
});