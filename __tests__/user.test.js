const express = require('express');
const app = require('../index');
const request = require('supertest')(app.testInstance);
const controller = require('../controllers/userController');

test('Users description changing', () => {
    const token = '';

    const response = request.put('/api/user/description')
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${token}`)
    .set({
        newDescription: 'Some very cool description!'
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
});
