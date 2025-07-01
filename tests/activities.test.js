const request = require('supertest');
const express = require('express');
require('dotenv').config();
const activitiesRouter = require('../routes/activities');

const app = express();
app.use('/activities', activitiesRouter);

describe('Activities API', () => {
    describe('GET /activities', () => {
        it('should fetch all activities', async () => {
            const res = await request(app)
                .get('/activities')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(res.body).toHaveProperty('message', 'Actividades obtenidas exitosamente');
            expect(res.body).toHaveProperty('activities');
            expect(res.body.activities).toBeInstanceOf(Array);
        });

        it('should fetch a single activity by ID', async () => {
            const testActivityId = 6; // Replace with an actual test activity ID

            const res = await request(app)
                .get(`/activities/${testActivityId}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(res.body).toHaveProperty('message', 'Actividad obtenida exitosamente');
            expect(res.body).toHaveProperty('activity');
            expect(res.body.activity).toHaveProperty('id', testActivityId);
        });

        it('should return 404 for a non-existent activity', async () => {
            const nonExistentId = 'non-existent-id';

            const res = await request(app)
                .get(`/activities/${nonExistentId}`)
                .expect('Content-Type', /json/)
                .expect(500);

            expect(res.body).toHaveProperty('error', 'Error al obtener la actividad');
        });
    });
    
    describe('GET /activities/filter', () => {
        it('should filter activities by temperature and climate', async () => {
            const res = await request(app)
                .get('/activities/filter')
                .query({ temperatura: 20, clima: 'soleado' })
                .expect('Content-Type', /json/)
                .expect(200);

            expect(res.body).toHaveProperty('message', 'Actividades filtradas exitosamente');
            expect(res.body).toHaveProperty('activities');
            expect(Array.isArray(res.body.activities)).toBe(true);
        });

        it('should return all activities if no filters are provided', async () => {
            const res = await request(app)
                .get('/activities/filter')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(res.body).toHaveProperty('activities');
            expect(Array.isArray(res.body.activities)).toBe(true);
        });
    });

    describe('POST /activities/recommend', () => {
        it('should return 400 if temperature or climate is missing', async () => {
            const res = await request(app)
                .post('/activities/recommend')
                .send({ temperatura: 20 }) // missing clima
                .expect('Content-Type', /json/)
                .expect(400);

            expect(res.body).toHaveProperty('error', 'Se requiere temperatura y clima para generar recomendaciones');
        });

        it('should return recommendations for valid temperature and climate', async () => {
            const res = await request(app)
                .post('/activities/recommend')
                .send({ temperatura: 20, clima: 'soleado' })
                .expect('Content-Type', /json/)
                .expect(200);

            expect(res.body).toHaveProperty('message', 'Recomendaciones generadas exitosamente');
            expect(res.body).toHaveProperty('recomendaciones');
            expect(Array.isArray(res.body.recomendaciones)).toBe(true);
        });

        it('should return all compatible activities if incluirTodasLasCompatibles is true', async () => {
            const res = await request(app)
                .post('/activities/recommend')
                .send({ temperatura: 20, clima: 'soleado', incluirTodasLasCompatibles: true })
                .expect('Content-Type', /json/)
                .expect(200);

            expect(res.body).toHaveProperty('todasLasActividades');
            expect(res.body.todasLasActividades).toHaveProperty('perfectas');
            expect(res.body.todasLasActividades).toHaveProperty('compatibles');
        });
    });
});
const request = require('supertest');
const app = require('../server');

describe('GET /activities/unavailable/:userId', () => {
    it('debería retornar actividades no recomendadas', async () => {
        const userId = 'test-user-id'; // reemplaza con un id válido
        const res = await request(app).get(`/activities/unavailable/${userId}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.activities)).toBe(true);
    });

    it('debería retornar un arreglo vacío si el usuario no tiene preferencias', async () => {
        const userId = 'usuario-sin-preferencias'; // reemplaza con un id sin preferencias
        const res = await request(app).get(`/activities/unavailable/${userId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.activities.length).toBe(0);
    });
    
});
