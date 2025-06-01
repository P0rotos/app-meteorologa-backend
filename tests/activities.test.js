const request = require('supertest');
const express = require('express');
require('dotenv').config();
const activitiesRouter = require('../routes/activities');

const app = express();
app.use('/activities', activitiesRouter);

describe('Activities API', () => {
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
        const testActivityId = 1; // Replace with an actual test activity ID

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