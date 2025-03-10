// tests/client.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const Client = require('../src/models/Client');
const User = require('../src/models/User');

let mongoServer;
let adminToken;
let operatorToken;
let testClientId;

// Prima di tutti i test
beforeAll(async () => {
  // Configura database in memoria per i test
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Sovrascrive la connessione per i test
  process.env.MONGODB_URI = uri;
  
  // Crea utenti di test
  const admin = await User.create({
    name: 'Admin Test',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin'
  });
  
  const operator = await User.create({
    name: 'Operator Test',
    email: 'operator@test.com',
    password: 'password123',
    role: 'operator'
  });
  
  // Simula login per ottenere token
  const adminAuth = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'admin@test.com',
      password: 'password123'
    });
  adminToken = adminAuth.body.token;
  
  const operatorAuth = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'operator@test.com',
      password: 'password123'
    });
  operatorToken = operatorAuth.body.token;
}, 30000); // Timeout più lungo per la creazione del server MongoDB

// Dopo tutti i test
afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

// Prima di ogni test
beforeEach(async () => {
  // Pulisci la collezione clienti
  await Client.deleteMany({});
});

describe('API Client', () => {
  describe('POST /api/clients', () => {
    it('Dovrebbe creare un nuovo cliente con dati validi', async () => {
      const clientData = {
        name: 'Azienda Test',
        companyType: 'LLC',
        fiscalCode: 'RSSMRA80A01H501U',
        vatNumber: '12345678901',
        contactInfo: {
          email: 'info@aziendatest.it',
          phone: '02 1234567',
          address: {
            street: 'Via Roma 123',
            city: 'Milano',
            province: 'MI',
            postalCode: '20100',
            country: 'Italy'
          }
        },
        legalRepresentative: {
          firstName: 'Mario',
          lastName: 'Rossi',
          fiscalCode: 'RSSMRA80A01H501U',
          role: 'Amministratore'
        },
        services: ['Contabilità', 'Consulenza fiscale']
      };
      
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(clientData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.name).toBe('Azienda Test');
      expect(res.body.data.companyType).toBe('LLC');
      expect(res.body.data.onboarding.status).toBe('new');
      expect(res.body.data.onboarding.checklist.length).toBeGreaterThan(0);
      
      testClientId = res.body.data._id;
    });
    
    it('Dovrebbe fallire con dati mancanti', async () => {
      const invalidData = {
        name: 'Azienda Incompleta'
        // Dati mancanti
      };
      
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
    
    it('Dovrebbe richiedere autorizzazione admin/manager', async () => {
      const clientData = {
        name: 'Azienda Test',
        companyType: 'LLC',
        contactInfo: {
          email: 'info@test.it',
          phone: '02 1234567',
          address: {
            street: 'Via Test',
            city: 'Roma',
            province: 'RM',
            postalCode: '00100',
            country: 'Italy'
          }
        },
        fiscalCode: 'RSSMRA80A01H501U'
      };
      
      const res = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${operatorToken}`) // Operator role
        .send(clientData);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
  
  describe('GET /api/clients', () => {
    beforeEach(async () => {
      // Crea alcuni clienti di test
      await Client.create([
        {
          name: 'Cliente Test 1',
          companyType: 'Individual',
          fiscalCode: 'RSSMRA80A01H501U',
          contactInfo: {
            email: 'test1@example.com',
            phone: '123456789',
            address: {
              street: 'Via Test 1',
              city: 'Roma',
              province: 'RM',
              postalCode: '00100',
              country: 'Italy'
            }
          },
          onboarding: { status: 'new' }
        },
        {
          name: 'Cliente Test 2',
          companyType: 'Corporation',
          vatNumber: '12345678901',
          contactInfo: {
            email: 'test2@example.com',
            phone: '987654321',
            address: {
              street: 'Via Test 2',
              city: 'Milano',
              province: 'MI',
              postalCode: '20100',
              country: 'Italy'
            }
          },
          onboarding: { status: 'in_progress' }
        }
      ]);
    });
    
    it('Dovrebbe recuperare tutti i clienti', async () => {
      const res = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body).toHaveProperty('pagination');
    });
    
    it('Dovrebbe filtrare per stato onboarding', async () => {
      const res = await request(app)
        .get('/api/clients?status=in_progress')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Cliente Test 2');
    });
    
    it('Dovrebbe filtrare per tipo società', async () => {
      const res = await request(app)
        .get('/api/clients?companyType=Individual')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Cliente Test 1');
    });
    
    it('Dovrebbe cercare per testo', async () => {
      const res = await request(app)
        .get('/api/clients?search=Test%202')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Cliente Test 2');
    });
  });
  
  // Altri test possono essere aggiunti per coprire gli altri endpoint...
});