import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { resetMemoryStore } from '../src/utils/db';
import { signToken } from '../src/utils/jwt';

describe('Events API (/api/events)', () => {
  let organizerToken: string;
  let otherOrganizerToken: string;
  let adminToken: string;

  beforeEach(() => {
    resetMemoryStore();

    // organizer 1 token (user-organizer-1)
    organizerToken = signToken({
      userId: 'user-organizer-1',
      email: 'alex@devconf.org',
      role: 'ORGANIZER',
    });

    // organizer 2 token (user-organizer-2)
    otherOrganizerToken = signToken({
      userId: 'user-organizer-2',
      email: 'elena@cloudsummit.tech',
      role: 'ORGANIZER',
    });

    // admin token (user-admin-1)
    adminToken = signToken({
      userId: 'user-admin-1',
      email: 'admin@eventsphere.io',
      role: 'ADMIN',
    });
  });

  describe('Public Discovery', () => {
    it('should list all published events for public users without drafts', async () => {
      const res = await request(app).get('/api/events');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      // Verify no drafts are returned
      const hasDraft = res.body.data.some((e: any) => e.status === 'DRAFT');
      expect(hasDraft).toBe(false);
    });

    it('should filter events by category', async () => {
      const res = await request(app)
        .get('/api/events')
        .query({ category: 'Artificial Intelligence' });

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      res.body.data.forEach((e: any) => {
        expect(e.category).toBe('Artificial Intelligence');
      });
    });

    it('should filter events by format (ONLINE / IN_PERSON)', async () => {
      const res = await request(app)
        .get('/api/events')
        .query({ format: 'ONLINE' });

      expect(res.status).toBe(200);
      res.body.data.forEach((e: any) => {
        expect(e.format).toBe('ONLINE');
        expect(e.onlineUrl).toBeDefined();
      });
    });

    it('should allow public user to view a published event by slug', async () => {
      const res = await request(app).get('/api/events/slug/global-ai-llm-systems-summit-2026');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.event.title).toBe('Global AI & LLM Systems Summit 2026');
    });

    it('should reject public user attempting to view a draft event by slug (returns 404)', async () => {
      const res = await request(app).get('/api/events/slug/quantum-computing-algorithms-post-quantum-crypto');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should allow the organizer to view their own draft event by slug', async () => {
      const res = await request(app)
        .get('/api/events/slug/quantum-computing-algorithms-post-quantum-crypto')
        .set('Cookie', [`token=${organizerToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.event.status).toBe('DRAFT');
    });

    it('should return list of unique categories', async () => {
      const res = await request(app).get('/api/events/categories');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.categories)).toBe(true);
      expect(res.body.data.categories).toContain('Artificial Intelligence');
    });
  });

  describe('Event Creation & Validation', () => {
    it('should reject event creation if unauthenticated (401)', async () => {
      const res = await request(app)
        .post('/api/events')
        .send({
          title: 'Unauthenticated Event',
        });

      expect(res.status).toBe(401);
    });

    it('should allow authenticated organizer to create an in-person event', async () => {
      const eventData = {
        title: 'Full-Stack TypeScript Summit 2027',
        summary: 'Explore advanced TypeScript design patterns and full-stack architectures.',
        description: 'Comprehensive sessions covering React 19, Node 22, and distributed microservices with type safety.',
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
        category: 'Web Development',
        technologies: ['TypeScript', 'React', 'Node.js'],
        startDateTime: '2027-05-10T09:00:00.000Z',
        endDateTime: '2027-05-11T17:00:00.000Z',
        timezone: 'America/New_York',
        format: 'IN_PERSON',
        venue: 'Javits Center, New York, NY',
        targetAudience: 'Software Engineers and Architects',
        registrationUrl: 'https://example.com/register/ts-summit',
        status: 'PUBLISHED',
      };

      const res = await request(app)
        .post('/api/events')
        .set('Cookie', [`token=${organizerToken}`])
        .send(eventData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.event.id).toBeDefined();
      expect(res.body.data.event.slug).toBe('full-stack-typescript-summit-2027');
      expect(res.body.data.event.organizerId).toBe('user-organizer-1');
      expect(res.body.data.event.venue).toBe('Javits Center, New York, NY');
    });

    it('should reject event if endDateTime is before startDateTime', async () => {
      const invalidData = {
        title: 'Time Travel Conference',
        summary: 'A conference where time goes backwards.',
        description: 'Testing that invalid chronological dates are caught strictly by backend validation.',
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
        category: 'Web Development',
        technologies: ['Quantum'],
        startDateTime: '2027-05-11T17:00:00.000Z',
        endDateTime: '2027-05-10T09:00:00.000Z', // Before start!
        format: 'ONLINE',
        onlineUrl: 'https://stream.example.com',
        targetAudience: 'Physicists',
        registrationUrl: 'https://example.com/register',
      };

      const res = await request(app)
        .post('/api/events')
        .set('Cookie', [`token=${organizerToken}`])
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors.some((e: any) => e.field === 'endDateTime')).toBe(true);
    });

    it('should reject in-person event without a venue', async () => {
      const invalidData = {
        title: 'Missing Venue Conference',
        summary: 'In person conference with no location provided.',
        description: 'Should fail validation because venue is mandatory for IN_PERSON events.',
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
        category: 'Web Development',
        technologies: ['Architecture'],
        startDateTime: '2027-05-10T09:00:00.000Z',
        endDateTime: '2027-05-11T17:00:00.000Z',
        format: 'IN_PERSON',
        // venue missing!
        targetAudience: 'Developers',
        registrationUrl: 'https://example.com/register',
      };

      const res = await request(app)
        .post('/api/events')
        .set('Cookie', [`token=${organizerToken}`])
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body.errors.some((e: any) => e.field === 'venue')).toBe(true);
    });

    it('should reject online event without an onlineUrl', async () => {
      const invalidData = {
        title: 'Missing Online URL Conference',
        summary: 'Online conference with no join url provided.',
        description: 'Should fail validation because onlineUrl is mandatory for ONLINE events.',
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
        category: 'Web Development',
        technologies: ['Cloud'],
        startDateTime: '2027-05-10T09:00:00.000Z',
        endDateTime: '2027-05-11T17:00:00.000Z',
        format: 'ONLINE',
        // onlineUrl missing!
        targetAudience: 'Developers',
        registrationUrl: 'https://example.com/register',
      };

      const res = await request(app)
        .post('/api/events')
        .set('Cookie', [`token=${organizerToken}`])
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body.errors.some((e: any) => e.field === 'onlineUrl')).toBe(true);
    });
  });

  describe('Authorization Rules & Management', () => {
    it('should forbid organizer 2 from editing organizer 1 event (403)', async () => {
      // event-1 belongs to user-organizer-1
      const res = await request(app)
        .put('/api/events/event-1')
        .set('Cookie', [`token=${otherOrganizerToken}`]) // user-organizer-2
        .send({
          title: 'Hacked Event Title By Stranger',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Forbidden');
    });

    it('should allow organizer 1 to edit their own event (200)', async () => {
      const res = await request(app)
        .put('/api/events/event-1')
        .set('Cookie', [`token=${organizerToken}`])
        .send({
          title: 'Global AI & LLM Systems Summit 2026 (Updated Edition)',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.event.title).toBe('Global AI & LLM Systems Summit 2026 (Updated Edition)');
    });

    it('should allow admin to edit any organizer event (200)', async () => {
      // event-1 belongs to user-organizer-1, admin modifies it
      const res = await request(app)
        .put('/api/events/event-1')
        .set('Cookie', [`token=${adminToken}`])
        .send({
          summary: 'Moderated summary by system administrator.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.event.summary).toBe('Moderated summary by system administrator.');
    });

    it('should allow organizer to toggle status from PUBLISHED to DRAFT and back', async () => {
      const res = await request(app)
        .patch('/api/events/event-1/status')
        .set('Cookie', [`token=${organizerToken}`])
        .send({ status: 'DRAFT' });

      expect(res.status).toBe(200);
      expect(res.body.data.event.status).toBe('DRAFT');

      const resPublished = await request(app)
        .patch('/api/events/event-1/status')
        .set('Cookie', [`token=${organizerToken}`])
        .send({ status: 'PUBLISHED' });

      expect(resPublished.status).toBe(200);
      expect(resPublished.body.data.event.status).toBe('PUBLISHED');
    });

    it('should forbid organizer from deleting another organizer event, but allow their own', async () => {
      // Try to delete event-1 as user-organizer-2 -> 403
      const forbiddenRes = await request(app)
        .delete('/api/events/event-1')
        .set('Cookie', [`token=${otherOrganizerToken}`]);

      expect(forbiddenRes.status).toBe(403);

      // Delete event-1 as user-organizer-1 -> 200
      const okRes = await request(app)
        .delete('/api/events/event-1')
        .set('Cookie', [`token=${organizerToken}`]);

      expect(okRes.status).toBe(200);
      expect(okRes.body.success).toBe(true);

      // Verify event is gone
      const getRes = await request(app).get('/api/events/slug/global-ai-llm-systems-summit-2026');
      expect(getRes.status).toBe(404);
    });

    it('should list organizer events including drafts in manage view', async () => {
      const res = await request(app)
        .get('/api/events/manage/my-events')
        .set('Cookie', [`token=${organizerToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const statuses = res.body.data.map((e: any) => e.status);
      expect(statuses).toContain('DRAFT');
    });
  });
});
