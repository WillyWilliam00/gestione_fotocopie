import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index.js';
import { cleanTestDb, testDb } from '../db/test-setup.js';
import { seedTestData } from '../db/test-seed.js';
import { istituti } from '../../src/db/schema.js';
import { eq } from 'drizzle-orm';
import { loginAsAdmin, loginAsCollaboratore } from '../utils/test-helpers.js';

describe('Rotte /api/docenti', () => {
  beforeAll(async () => {
    await cleanTestDb();
    await seedTestData();
  });

  afterAll(async () => {
    await cleanTestDb();
  });

  it('GET /api/docenti restituisce lista paginata (autenticato)', async () => {
    const { token } = await loginAsAdmin();

    const res = await request(app)
      .get('/api/docenti')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    // Campi tipici della paginazione (non troppo rigidi)
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination).toHaveProperty('page');
    expect(res.body.pagination).toHaveProperty('pageSize');
    expect(res.body.pagination).toHaveProperty('totalItems');
  });

  it('GET /api/docenti senza token restituisce 401', async () => {
    const res = await request(app).get('/api/docenti');
    expect(res.status).toBe(401);
  });

  it('POST /api/docenti/new-docente crea un docente (solo admin)', async () => {
    const { token } = await loginAsAdmin();

    const res = await request(app)
      .post('/api/docenti/new-docente')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nome: 'Giulia',
        cognome: 'Neri',
        limiteCopie: 123,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.nome).toBe('Giulia');
    expect(res.body.data.cognome).toBe('Neri');
  });

  it('POST /api/docenti/new-docente con collaboratore restituisce 403', async () => {
    const { token } = await loginAsCollaboratore();

    const res = await request(app)
      .post('/api/docenti/new-docente')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nome: 'Giulia',
        cognome: 'Neri',
        limiteCopie: 123,
      });

    expect(res.status).toBe(403);
  });

  it('PUT /api/docenti/update-docente/:id aggiorna un docente (solo admin)', async () => {
    const { token } = await loginAsAdmin();

    // Prendiamo un id esistente dalla lista
    const listRes = await request(app)
      .get('/api/docenti')
      .set('Authorization', `Bearer ${token}`);
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.data.length).toBeGreaterThan(0);

    const docenteId = listRes.body.data[0].id as number;

    const res = await request(app)
      .put(`/api/docenti/update-docente/${docenteId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        nome: 'Mario',
        cognome: 'Rossi',
        limiteCopie: 999,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.id).toBe(docenteId);
  });

  it('DELETE /api/docenti/delete-docente/:id elimina un docente (solo admin)', async () => {
    const { token } = await loginAsAdmin();

    // Creiamo un docente e poi lo cancelliamo
    const createRes = await request(app)
      .post('/api/docenti/new-docente')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nome: 'Da',
        cognome: 'Eliminare',
        limiteCopie: 0,
      });
    expect(createRes.status).toBe(201);
    const docenteId = createRes.body.data.id as number;

    const res = await request(app)
      .delete(`/api/docenti/delete-docente/${docenteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.id).toBe(docenteId);
  });

  it('DELETE /api/docenti/delete-docente/:id con collaboratore restituisce 403', async () => {
    const { token } = await loginAsCollaboratore();
    const { token: adminToken } = await loginAsAdmin();
    //creiamo un docente con l'admin
    const createRes = await request(app)
      .post('/api/docenti/new-docente')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: 'Da',
        cognome: 'Eliminare',
        limiteCopie: 0,
      });
    expect(createRes.status).toBe(201);
    const docenteId = createRes.body.data.id as number;
    //prova a eliminarlo con il collaboratore
    const res = await request(app)
      .delete(`/api/docenti/delete-docente/${docenteId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it('PUT /api/docenti/update-docente/:id con collaboratore restituisce 403', async () => {
    const { token } = await loginAsCollaboratore();
    const { token: adminToken } = await loginAsAdmin();
    // Creiamo un docente con l'admin (nome/cognome univoci per non conflitto con altro test)
    const createRes = await request(app)
      .post('/api/docenti/new-docente')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: 'Da',
        cognome: 'Aggiornare',
        limiteCopie: 0,
      });
    expect(createRes.status).toBe(201);
    const docenteId = createRes.body.data.id as number;
    //prova a aggiornarlo con il collaboratore
    const res = await request(app)
      .put(`/api/docenti/update-docente/${docenteId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        nome: 'Mario',
        cognome: 'Rossi',
        limiteCopie: 999,
      });
    expect(res.status).toBe(403);
  });

  describe('Isolamento multi-tenant', () => {
    let adminIstituto1Token: string;
    let adminIstituto2Token: string;
    let docenteIstituto2Id: number;

    beforeAll(async () => {
      // Crea un secondo istituto con admin
      const setupRes = await request(app)
        .post('/api/auth/setup-scuola')
        .send({
          istituto: {
            nome: 'Seconda Scuola',
            codiceIstituto: 'SCUOLA2000',
          },
          utente: {
            email: 'admin2@test.com',
            password: 'password123',
          },
        });
      expect(setupRes.status).toBe(201);
      
      // Login come admin del secondo istituto
      const login2Res = await request(app)
        .post('/api/auth/login')
        .send({
          identifier: 'admin2@test.com',
          password: 'password123',
        });
      adminIstituto2Token = login2Res.body.token;
      
      // Login come admin del primo istituto (quello del seed)
      const login1Result = await loginAsAdmin();
      adminIstituto1Token = login1Result.token;

      // Crea un docente per il secondo istituto
      const createDocente2Res = await request(app)
        .post('/api/docenti/new-docente')
        .set('Authorization', `Bearer ${adminIstituto2Token}`)
        .send({
          nome: 'Docente',
          cognome: 'Istituto2',
          limiteCopie: 50,
        });
      expect(createDocente2Res.status).toBe(201);
      docenteIstituto2Id = createDocente2Res.body.data.id;
    });

    it('GET /api/docenti restituisce solo docenti del proprio istituto', async () => {
      // Admin del primo istituto vede solo i suoi docenti
      const res = await request(app)
        .get('/api/docenti')
        .set('Authorization', `Bearer ${adminIstituto1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      
      // Verifica che tutti i docenti restituiti appartengano al primo istituto
      const [istituto1] = await testDb
        .select()
        .from(istituti)
        .where(eq(istituti.codiceIstituto, 'TEST123456'));
      
      expect(istituto1).toBeDefined();
      
      // Tutti i docenti devono avere lo stesso istitutoId
      res.body.data.forEach((docente: any) => {
        expect(docente.istitutoId).toBe(istituto1!.id);
      });
      
      // Verifica che il docente del secondo istituto NON sia presente
      const docenteIstituto2Presente = res.body.data.some(
        (d: any) => d.id === docenteIstituto2Id
      );
      expect(docenteIstituto2Presente).toBe(false);
    });

    it('PUT /api/docenti/update-docente/:id non può modificare docenti di altri istituti', async () => {
      // Admin del primo istituto prova a modificare docente del secondo istituto
      const res = await request(app)
        .put(`/api/docenti/update-docente/${docenteIstituto2Id}`)
        .set('Authorization', `Bearer ${adminIstituto1Token}`)
        .send({
          nome: 'Hacker',
          cognome: 'Tentativo',
          limiteCopie: 999,
        });

      // Il tenantStore filtra per istitutoId, quindi non trova il docente → 404
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('DELETE /api/docenti/delete-docente/:id non può eliminare docenti di altri istituti', async () => {
      // Admin del primo istituto prova a eliminare docente del secondo istituto
      const res = await request(app)
        .delete(`/api/docenti/delete-docente/${docenteIstituto2Id}`)
        .set('Authorization', `Bearer ${adminIstituto1Token}`);

      // Il tenantStore filtra per istitutoId, quindi non trova il docente → 404
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('POST /api/docenti/new-docente crea sempre docenti per il proprio istituto', async () => {
      // Admin del primo istituto crea un docente
      const res = await request(app)
        .post('/api/docenti/new-docente')
        .set('Authorization', `Bearer ${adminIstituto1Token}`)
        .send({
          nome: 'Nuovo',
          cognome: 'Docente1',
          limiteCopie: 200,
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('istitutoId');
      
      // Verifica che il docente creato appartenga al primo istituto
      const [istituto1] = await testDb
        .select()
        .from(istituti)
        .where(eq(istituti.codiceIstituto, 'TEST123456'));
      
      expect(res.body.data.istitutoId).toBe(istituto1!.id);
      
      // Verifica che NON appartenga al secondo istituto
      const [istituto2] = await testDb
        .select()
        .from(istituti)
        .where(eq(istituti.codiceIstituto, 'SCUOLA2000'));
      
      expect(res.body.data.istitutoId).not.toBe(istituto2!.id);
    });
  });
});

