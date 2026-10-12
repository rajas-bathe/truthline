import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { getDatabase } from '../src/database/db';
import { runMigrations } from '../src/database/migrations';

const app = createApp();

beforeAll(() => {
  const db = getDatabase();
  runMigrations(db);
});

describe('API: Core Server Endpoints', () => {
  it('GET / should return service branding and tagline', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body.name).toContain('TRUTHLINE AI');
    expect(res.body.tagline).toBe("DON'T JUST FORWARD. VERIFY.");
    expect(res.body.status).toBe('ONLINE');
  });

  it('GET /api/health should return system status and provider configuration', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ONLINE');
    expect(res.body.service).toContain('TRUTHLINE AI');
    expect(res.body.providers).toBeDefined();
    expect(res.body.constraints).toBeDefined();
  });

  it('GET /api/demo/samples should return pre-configured factual samples', async () => {
    const res = await request(app).get('/api/demo/samples');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.samples)).toBe(true);
    expect(res.body.samples.length).toBeGreaterThan(0);
    expect(res.body.samples[0].expectedVerdict).toBeDefined();
    expect(res.body.samples[0].claim).toBeDefined();
  });
});

describe('API: Authentication & Session Routes', () => {
  it('POST /api/auth/session should issue a verifiable session token', async () => {
    const res = await request(app)
      .post('/api/auth/session')
      .send({ client: 'extension-test' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.sessionId).toBeDefined();
    expect(res.body.expiresAt).toBeDefined();

    // Validate the issued token
    const validateRes = await request(app)
      .get('/api/auth/validate')
      .set('X-Truthline-Session', res.body.token);

    expect(validateRes.status).toBe(200);
    expect(validateRes.body.valid).toBe(true);
  });

  it('GET /api/auth/validate should reject missing or invalid tokens', async () => {
    const res = await request(app).get('/api/auth/validate');
    expect(res.status).toBe(401);
    expect(res.body.valid).toBe(false);

    const badRes = await request(app)
      .get('/api/auth/validate')
      .set('X-Truthline-Session', 'invalid.token.signature');
    expect(badRes.status).toBe(401);
  });
});

describe('API: Verification & History Routes', () => {
  it('POST /api/verify should reject verification requests when consent is false or missing', async () => {
    const res = await request(app)
      .post('/api/verify')
      .send({
        inputType: 'text',
        content: 'Unchecked claim statement',
        consent: false
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Consent');
  });

  it('POST /api/verify should successfully process claim when consent is provided', async () => {
    const res = await request(app)
      .post('/api/verify')
      .send({
        inputType: 'text',
        content: 'NASA confirmed 15 days of total darkness starting next Monday.',
        consent: true
      });

    expect(res.status).toBe(200);
    expect(res.body.id).toBeDefined();
    expect(res.body.overallVerdict).toBeDefined();
    expect(res.body.explanation).toBeDefined();
    expect(res.body.whatsappRebuttal).toBeDefined();
    expect(res.body.stageTimings).toBeDefined();

    // Verify record retrieval by ID
    const getRes = await request(app).get(`/api/verify/${res.body.id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.id).toBe(res.body.id);
  });

  it('GET /api/verify/:id should return 404 for unknown ID', async () => {
    const res = await request(app).get('/api/verify/non-existent-id-000');
    expect(res.status).toBe(404);
  });

  it('GET /api/history and DELETE /api/history/:id should manage records', async () => {
    const listRes = await request(app).get('/api/history');
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.items)).toBe(true);

    if (listRes.body.items.length > 0) {
      const firstId = listRes.body.items[0].id;
      const delRes = await request(app).delete(`/api/history/${firstId}`);
      expect(delRes.status).toBe(200);
      expect(delRes.body.deletedId).toBe(firstId);
    }
  });
});
