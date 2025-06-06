const request = require('supertest');
const express = require('express');
require('dotenv').config();
const userPreferencesRouter = require('../routes/user-preferences');

    const app = express();
    app.use('/user-preferences', userPreferencesRouter);

    describe('User Preferences API', () => {
        let testUserId;
        let testPreferenceId;

        beforeAll(async () => {
        testUserId = '2eb934d1-2641-468e-b31b-d6eca4a00a34';
        });

        it('should fetch user preferences', async () => {
            const res = await request(app)
                .get(`/user-preferences/${testUserId}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(res.body).toHaveProperty('message', 'Preferencias obtenidas exitosamente');
            expect(res.body).toHaveProperty('preferences');
        });

        it('should create a new user preference', async () => {
            const newPreference = {
                usuario_id: testUserId,
                actividad_id: '3',
                min_temp: 10,
                max_temp: 30,
                prefiere_soleado: true,
                prefiere_nublado: false,
                prefiere_lluvia: false
            };

            const res = await request(app)
                .post('/user-preferences')
                .send(newPreference)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(res.body).toHaveProperty('message', 'Preferencia creada exitosamente');
            expect(res.body).toHaveProperty('preference');
            testPreferenceId = res.body.preference.id;
        });

        it('should return 400 if usuario_id is missing on POST', async () => {
            const res = await request(app)
                .post('/user-preferences')
                .send({
                    actividad_id: '3',
                    min_temp: 10,
                    max_temp: 30,
                    prefiere_soleado: true
                })
            .expect('Content-Type', /json/)
            .expect(400);

            expect(res.body).toHaveProperty('error', 'usuario_id y actividad_id son requeridos');
        });

        it('should return 400 if min_temp > max_temp on POST', async () => {
            const res = await request(app)
                .post('/user-preferences')
                .send({
                    usuario_id: testUserId,
                    actividad_id: '3',
                    min_temp: 50,
                    max_temp: 10,
                    prefiere_soleado: true
                })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(res.body).toHaveProperty('error', 'min_temp no puede ser mayor que max_temp');
        });

        it('should update an existing user preference', async () => {
            const updateData = {
                min_temp: 15,
                max_temp: 25
            };

            const res = await request(app)
                .put(`/user-preferences/${testPreferenceId}`)
                .send(updateData)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(res.body).toHaveProperty('message', 'Preferencia actualizada exitosamente');
            expect(res.body.preference.min_temp).toBe(updateData.min_temp);
            expect(res.body.preference.max_temp).toBe(updateData.max_temp);
        });

        it('should return 400 if ID is missing on PUT', async () => {
            const res = await request(app)
                .put('/user-preferences/')
                .send({ min_temp: 10 })
                .expect(404); 
        });

        it('should return 400 if no fields are provided on PUT', async () => {
            const res = await request(app)
                .put(`/user-preferences/${testPreferenceId}`)
                .send({})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(res.body).toHaveProperty('error', 'Al menos un campo debe ser proporcionado para actualizar');
        });

        it('should return 400 if min_temp > max_temp on PUT', async () => {
            const res = await request(app)
                .put(`/user-preferences/${testPreferenceId}`)
                .send({ min_temp: 30, max_temp: 10 })
                .expect('Content-Type', /json/)
                .expect(400);

            expect(res.body).toHaveProperty('error', 'min_temp no puede ser mayor que max_temp');
        });

        it('should return 404 if updating a non-existent preference', async () => {
            const res = await request(app)
                .put('/user-preferences/99999999')
                .send({ min_temp: 10 })
                .expect('Content-Type', /json/)
                .expect(404);

            expect(res.body).toHaveProperty('error', 'Preferencia no encontrada');
        });

        it('should delete a user preference', async () => {
            const res = await request(app)
                .delete(`/user-preferences/${testPreferenceId}`)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(res.body).toHaveProperty('message', 'Preferencia eliminada exitosamente');
        });

        it('should return 400 if ID is missing on DELETE', async () => {
            const res = await request(app)
                .delete('/user-preferences/')
                .expect(404);
        });

        it('should return 404 if deleting a non-existent preference', async () => {
            const res = await request(app)
                .delete('/user-preferences/99999999')
                .expect('Content-Type', /json/)
                .expect(404);

            expect(res.body).toHaveProperty('error', 'Preferencia no encontrada');
        });


    });