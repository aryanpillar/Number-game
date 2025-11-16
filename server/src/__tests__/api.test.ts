import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes';
import treeRoutes from '../routes/treeRoutes';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler';
import { setupTestDatabase, teardownTestDatabase } from './setup';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/trees', treeRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

describe('API Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/auth/register', () => {
      it('should register a new user successfully', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({ username: 'testuser', password: 'password123' });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('userId');
        expect(response.body.username).toBe('testuser');
        expect(response.body.message).toBe('User registered successfully');
      });

      it('should reject registration with duplicate username', async () => {
        await request(app)
          .post('/api/auth/register')
          .send({ username: 'duplicate', password: 'password123' });

        const response = await request(app)
          .post('/api/auth/register')
          .send({ username: 'duplicate', password: 'password123' });

        expect(response.status).toBe(409);
        expect(response.body.error).toBe('ConflictError');
        expect(response.body.message).toBe('Username already exists');
      });

      it('should reject registration with short password', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({ username: 'shortpass', password: '12345' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('ValidationError');
      });

      it('should reject registration with missing fields', async () => {
        const response = await request(app)
          .post('/api/auth/register')
          .send({ username: 'nopassword' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('ValidationError');
      });
    });

    describe('POST /api/auth/login', () => {
      beforeAll(async () => {
        await request(app)
          .post('/api/auth/register')
          .send({ username: 'loginuser', password: 'password123' });
      });

      it('should login successfully with valid credentials', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ username: 'loginuser', password: 'password123' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('userId');
        expect(response.body.username).toBe('loginuser');
      });

      it('should reject login with invalid password', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ username: 'loginuser', password: 'wrongpassword' });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('AuthenticationError');
      });

      it('should reject login with non-existent user', async () => {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ username: 'nonexistent', password: 'password123' });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('AuthenticationError');
      });
    });
  });

  describe('Calculation Tree Endpoints', () => {
    let authToken: string;
    let userId: number;

    beforeAll(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'treeuser', password: 'password123' });
      authToken = response.body.token;
      userId = response.body.userId;
    });

    describe('POST /api/trees', () => {
      it('should create a new tree with starting number', async () => {
        const response = await request(app)
          .post('/api/trees')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ startingNumber: 10 });

        expect(response.status).toBe(201);
        expect(response.body.tree).toBeDefined();
        expect(response.body.tree.startingNumber).toBe(10);
        expect(response.body.tree.rootNode.result).toBe(10);
      });

      it('should reject tree creation without authentication', async () => {
        const response = await request(app)
          .post('/api/trees')
          .send({ startingNumber: 10 });

        expect(response.status).toBe(401);
      });

      it('should reject tree creation with invalid starting number', async () => {
        const response = await request(app)
          .post('/api/trees')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ startingNumber: 'invalid' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('ValidationError');
      });
    });

    describe('GET /api/trees', () => {
      it('should fetch all trees', async () => {
        const response = await request(app).get('/api/trees');

        expect(response.status).toBe(200);
        expect(response.body.trees).toBeDefined();
        expect(Array.isArray(response.body.trees)).toBe(true);
      });
    });

    describe('POST /api/trees/:treeId/operations', () => {
      let treeId: number;
      let rootNodeId: number;

      beforeAll(async () => {
        const response = await request(app)
          .post('/api/trees')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ startingNumber: 20 });
        treeId = response.body.tree.id;
        rootNodeId = response.body.tree.rootNode.id;
      });

      it('should add an operation to a node', async () => {
        const response = await request(app)
          .post(`/api/trees/${treeId}/operations`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            parentNodeId: rootNodeId,
            operation: 'add',
            rightArgument: 5
          });

        expect(response.status).toBe(201);
        expect(response.body.node).toBeDefined();
      });

      it('should reject operation without authentication', async () => {
        const response = await request(app)
          .post(`/api/trees/${treeId}/operations`)
          .send({
            parentNodeId: rootNodeId,
            operation: 'add',
            rightArgument: 5
          });

        expect(response.status).toBe(401);
      });

      it('should reject division by zero', async () => {
        const response = await request(app)
          .post(`/api/trees/${treeId}/operations`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            parentNodeId: rootNodeId,
            operation: 'divide',
            rightArgument: 0
          });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('Division by zero');
      });

      it('should reject invalid operation type', async () => {
        const response = await request(app)
          .post(`/api/trees/${treeId}/operations`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            parentNodeId: rootNodeId,
            operation: 'invalid',
            rightArgument: 5
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('ValidationError');
      });
    });
  });
});
