const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');

process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://example.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';

const createApp = () => {
  const controller = require('../controllers/adminController');
  const originalGetReports = controller.getReports;
  controller.getReports = (req, res) => res.json({ role: req.user.role });
  delete require.cache[require.resolve('./adminRoutes')];
  const router = require('./adminRoutes');
  controller.getReports = originalGetReports;

  const app = express();
  app.use('/admin', router);
  return app;
};

const tokenFor = (role) => jwt.sign({ id: `${role}-id`, role }, JWT_SECRET);

test('allows admin and super admin to access reports', async () => {
  const app = createApp();

  for (const role of ['admin', 'super_admin']) {
    const response = await request(app)
      .get('/admin/reports')
      .set('Authorization', `Bearer ${tokenFor(role)}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.role, role);
  }
});

test('denies patient, doctor, and assistant access to reports', async () => {
  const app = createApp();

  for (const role of ['patient', 'doctor', 'assistant']) {
    const response = await request(app)
      .get('/admin/reports')
      .set('Authorization', `Bearer ${tokenFor(role)}`);

    assert.equal(response.status, 403);
    assert.equal(response.body.message, 'Insufficient permissions');
  }
});

test('requires authentication for reports', async () => {
  const response = await request(createApp()).get('/admin/reports');

  assert.equal(response.status, 401);
  assert.equal(response.body.message, 'Authentication required');
});
