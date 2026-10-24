import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { resetMemoryStore } from '../src/utils/db';

describe('Authentication API (/api/auth)', () => {
  beforeEach(() => {
    resetMemoryStore();
  });

  it('should register a new organizer successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jordan Belfort',
        email: 'jordan@wallstreet.com',
        password: 'Password123!',
        role: 'ORGANIZER',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe('jordan@wallstreet.com');
    expect(res.body.data.user.role).toBe('ORGANIZER');
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.token).toBeDefined();

    // Check set-cookie header
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('token=');
    expect(cookies[0]).toContain('HttpOnly');
  });

  it('should reject registration if email is already taken', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Alex Copycat',
        email: 'alex@devconf.org', // Already in seed data
        password: 'Password123!',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already exists');
  });

  it('should reject registration with invalid password or email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'A',
        email: 'not-an-email',
        password: 'short',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThanOrEqual(2);
  });

  it('should login with valid seeded credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alex@devconf.org',
        password: 'OrganizerPass123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('alex@devconf.org');
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.token).toBeDefined();
  });

  it('should fail login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alex@devconf.org',
        password: 'WrongPassword999!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid email or password');
  });

  it('should retrieve current user profile with valid JWT cookie', async () => {
    // First login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alex@devconf.org',
        password: 'OrganizerPass123!',
      });

    const cookie = loginRes.headers['set-cookie'];

    // Call /me
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookie);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.user.email).toBe('alex@devconf.org');
    expect(meRes.body.data.user.passwordHash).toBeUndefined();
  });

  it('should reject /me without authentication', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should clear cookie upon logout', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/token=;/);
  });
});
