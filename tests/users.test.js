const request = require('supertest');
const express = require('express');
require('dotenv').config();
const usersRouter = require('../routes/users');

const app = express();
app.use(express.json());
app.use('/users', usersRouter);

let userId = null;

describe('Users Routes', () => {
    describe('POST /users/register', () => {
        it('should register a new user', async () => {
            const response = await request(app)
                .post('/users/register')
                .send({ nombre: 'Test User', email: 'test@example.com', password: 'password123' });
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'usuario created');
            expect(response.body).toHaveProperty('user');
            userId = response.body.user.id;
        });

        it('should return 400 if required fields are missing', async () => {
            const response = await request(app)
                .post('/users/register')
                .send({ email: 'test@example.com' });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Nombre, Password and email are required');
        });
    });

    describe('POST /users/login', () => {
        it('should log in an existing user', async () => {
            const response = await request(app)
                .post('/users/login')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'usuario logged in');
            expect(response.body).toHaveProperty('user');
            expect(response.body).toHaveProperty('session');
        });

        it('should return 401 for invalid credentials', async () => {
            const response = await request(app)
                .post('/users/login')
                .send({ email: 'test@example.com', password: 'wrongpassword' });

            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('error', 'Invalid credentials');
        });
    });

    describe('PUT /users/favorite-city/:id', () => {
        it('should update the favorite city for a user', async () => {
            const response = await request(app)
                .put(`/users/favorite-city/${userId}`)
                .send({ ciudad_id: '2481' });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Favorite city updated successfully');
            expect(response.body).toHaveProperty('favoriteCity');
            expect(response.body.favoriteCity).toHaveProperty('nombre', 'Valparaiso');
        });

        it('should return 400 if ciudad_id is not provided', async () => {
            const response = await request(app)
                .put(`/users/favorite-city/${userId}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'ciudad_id is required');
        });

        it('should return 404 if city does not exist', async () => {
            const response = await request(app)
                .put(`/users/favorite-city/${userId}`)
                .send({ ciudad_id: 'nonexistent-id' });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'Ciudad not found');
        });

        it('should return 400 if id is not provided', async () => {
            const response = await request(app)
                .put('/users/favorite-city/')
                .send({ ciudad_id: '2481' });

            expect(response.status).toBe(404); // Express returns 404 for missing param
        });
    });

    describe('POST /users/logout', () => {
        it('should log out the user', async () => {
            const response = await request(app)
                .post('/users/logout');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'usuario logged out successfully');
        });
    });

    describe('DELETE /users', () => {
        it('should delete an existing user', async () => {
            const deleteResponse = await request(app)
                .delete('/users')
                .send({ id: userId });

            expect(deleteResponse.status).toBe(200);
            expect(deleteResponse.body).toHaveProperty('message', 'usuario deleted Successfully');
        });

        it('should return 404 if the user does not exist', async () => {
            const response = await request(app)
                .delete('/users')
                .send({ id: 'nonexistent-id' });

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('error', 'user_id must be an UUID');
        });

        it('should return 400 if ID is not provided', async () => {
            const response = await request(app)
                .delete('/users')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'ID is required');
        });
    });
});