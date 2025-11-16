import request from 'supertest';
import express from 'express';
import cors from 'cors';
import authRoutes from '../routes/authRoutes';
import treeRoutes from '../routes/treeRoutes';
import { errorHandler } from '../middleware/errorHandler';
import { initializeDatabase, closeDatabase } from '../database/connection';

describe('End-to-End User Flows', () => {
  let app: express.Application;
  let authToken: string;
  let userId: number;
  let treeId: number;
  let rootNodeId: number;

  beforeAll(async () => {
    // Initialize test database
    process.env.DATABASE_PATH = ':memory:';
    await initializeDatabase();

    // Set up Express app
    app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/trees', treeRoutes);
    app.use(errorHandler);
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('User Flow 1: Unregistered User Views Trees', () => {
    it('should allow unregistered user to view all trees', async () => {
      const response = await request(app)
        .get('/api/trees')
        .expect(200);

      expect(response.body).toHaveProperty('trees');
      expect(Array.isArray(response.body.trees)).toBe(true);
    });
  });

  describe('User Flow 2: Registration and Login', () => {
    const testUser = {
      username: 'testuser123',
      password: 'password123'
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('userId');
      userId = response.body.userId;
    });

    it('should reject duplicate username registration', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send(testUser)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('username', testUser.username);
      expect(response.body).toHaveProperty('userId');
      authToken = response.body.token;
    });

    it('should reject login with invalid password', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword'
        })
        .expect(401);
    });

    it('should reject login with non-existent user', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistentuser',
          password: 'password123'
        })
        .expect(401);
    });
  });

  describe('User Flow 3: Creating Starting Numbers', () => {
    it('should reject tree creation without authentication', async () => {
      await request(app)
        .post('/api/trees')
        .send({ startingNumber: 42 })
        .expect(401);
    });

    it('should create a new tree with starting number (integer)', async () => {
      const response = await request(app)
        .post('/api/trees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ startingNumber: 42 })
        .expect(201);

      expect(response.body).toHaveProperty('tree');
      expect(response.body.tree).toHaveProperty('id');
      expect(response.body.tree).toHaveProperty('startingNumber', 42);
      expect(response.body.tree).toHaveProperty('rootNode');
      expect(response.body.tree.rootNode.result).toBe(42);
      
      treeId = response.body.tree.id;
      rootNodeId = response.body.tree.rootNode.id;
    });

    it('should create a new tree with starting number (decimal)', async () => {
      const response = await request(app)
        .post('/api/trees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ startingNumber: 3.14 })
        .expect(201);

      expect(response.body.tree.startingNumber).toBe(3.14);
      expect(response.body.tree.rootNode.result).toBe(3.14);
    });

    it('should reject invalid starting number', async () => {
      await request(app)
        .post('/api/trees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ startingNumber: 'not a number' })
        .expect(400);
    });

    it('should display newly created tree in tree list', async () => {
      const response = await request(app)
        .get('/api/trees')
        .expect(200);

      expect(response.body.trees.length).toBeGreaterThan(0);
      const createdTree = response.body.trees.find((t: any) => t.id === treeId);
      expect(createdTree).toBeDefined();
      expect(createdTree.startingNumber).toBe(42);
    });
  });

  describe('User Flow 4: Adding Operations to Any Node', () => {
    it('should reject operation without authentication', async () => {
      await request(app)
        .post(`/api/trees/${treeId}/operations`)
        .send({
          parentNodeId: rootNodeId,
          operation: 'add',
          rightArgument: 10
        })
        .expect(401);
    });

    it('should add addition operation to root node', async () => {
      const response = await request(app)
        .post(`/api/trees/${treeId}/operations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentNodeId: rootNodeId,
          operation: 'add',
          rightArgument: 10
        })
        .expect(201);

      expect(response.body).toHaveProperty('node');
      expect(response.body.node.operation).toBe('add');
      expect(response.body.node.right_argument).toBe(10);
      expect(response.body.node.result).toBe(52); // 42 + 10
      expect(response.body.node.parent_node_id).toBe(rootNodeId);
    });

    it('should add subtraction operation to root node', async () => {
      const response = await request(app)
        .post(`/api/trees/${treeId}/operations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentNodeId: rootNodeId,
          operation: 'subtract',
          rightArgument: 5
        })
        .expect(201);

      expect(response.body.node.operation).toBe('subtract');
      expect(response.body.node.result).toBe(37); // 42 - 5
    });

    it('should add multiplication operation to root node', async () => {
      const response = await request(app)
        .post(`/api/trees/${treeId}/operations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentNodeId: rootNodeId,
          operation: 'multiply',
          rightArgument: 2
        })
        .expect(201);

      expect(response.body.node.operation).toBe('multiply');
      expect(response.body.node.result).toBe(84); // 42 * 2
    });

    it('should add division operation to root node', async () => {
      const response = await request(app)
        .post(`/api/trees/${treeId}/operations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentNodeId: rootNodeId,
          operation: 'divide',
          rightArgument: 6
        })
        .expect(201);

      expect(response.body.node.operation).toBe('divide');
      expect(response.body.node.result).toBe(7); // 42 / 6
    });

    it('should reject division by zero', async () => {
      await request(app)
        .post(`/api/trees/${treeId}/operations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentNodeId: rootNodeId,
          operation: 'divide',
          rightArgument: 0
        })
        .expect(400);
    });

    it('should reject invalid operation type', async () => {
      await request(app)
        .post(`/api/trees/${treeId}/operations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentNodeId: rootNodeId,
          operation: 'modulo',
          rightArgument: 5
        })
        .expect(400);
    });
  });

  describe('User Flow 5: Creating Branching Discussions', () => {
    let childNodeId: number;

    it('should add operation to create first level child', async () => {
      const response = await request(app)
        .post(`/api/trees/${treeId}/operations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentNodeId: rootNodeId,
          operation: 'add',
          rightArgument: 100
        })
        .expect(201);

      childNodeId = response.body.node.id;
      expect(response.body.node.result).toBe(142); // 42 + 100
    });

    it('should add operation to child node (second level)', async () => {
      const response = await request(app)
        .post(`/api/trees/${treeId}/operations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentNodeId: childNodeId,
          operation: 'multiply',
          rightArgument: 2
        })
        .expect(201);

      expect(response.body.node.result).toBe(284); // 142 * 2
      expect(response.body.node.parent_node_id).toBe(childNodeId);
    });

    it('should add multiple branches to same parent node', async () => {
      // First branch
      const response1 = await request(app)
        .post(`/api/trees/${treeId}/operations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentNodeId: childNodeId,
          operation: 'add',
          rightArgument: 10
        })
        .expect(201);

      expect(response1.body.node.result).toBe(152); // 142 + 10

      // Second branch
      const response2 = await request(app)
        .post(`/api/trees/${treeId}/operations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentNodeId: childNodeId,
          operation: 'subtract',
          rightArgument: 10
        })
        .expect(201);

      expect(response2.body.node.result).toBe(132); // 142 - 10
    });

    it('should retrieve tree with complete hierarchical structure', async () => {
      const response = await request(app)
        .get('/api/trees')
        .expect(200);

      const tree = response.body.trees.find((t: any) => t.id === treeId);
      expect(tree).toBeDefined();
      expect(tree.rootNode).toBeDefined();
      expect(tree.rootNode.children.length).toBeGreaterThan(0);
      
      // Verify hierarchical structure
      const childNode = tree.rootNode.children.find((c: any) => c.id === childNodeId);
      expect(childNode).toBeDefined();
      expect(childNode.children.length).toBeGreaterThan(0);
    });
  });

  describe('User Flow 6: Multiple Users Interaction', () => {
    let secondUserToken: string;
    let secondUserId: number;

    it('should register second user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'seconduser',
          password: 'password456'
        })
        .expect(201);

      secondUserId = response.body.userId;
    });

    it('should login second user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'seconduser',
          password: 'password456'
        })
        .expect(200);

      secondUserToken = response.body.token;
    });

    it('should allow second user to add operation to first user\'s tree', async () => {
      const response = await request(app)
        .post(`/api/trees/${treeId}/operations`)
        .set('Authorization', `Bearer ${secondUserToken}`)
        .send({
          parentNodeId: rootNodeId,
          operation: 'add',
          rightArgument: 1000
        })
        .expect(201);

      expect(response.body.node.result).toBe(1042); // 42 + 1000
      expect(response.body.node.user_id).toBe(secondUserId);
    });

    it('should show creator username for each node', async () => {
      const response = await request(app)
        .get('/api/trees')
        .expect(200);

      const tree = response.body.trees.find((t: any) => t.id === treeId);
      expect(tree.rootNode.username).toBe('testuser123');
      
      // Find node created by second user
      const secondUserNode = tree.rootNode.children.find(
        (c: any) => c.userId === secondUserId
      );
      expect(secondUserNode).toBeDefined();
      expect(secondUserNode.username).toBe('seconduser');
    });
  });

  describe('User Flow 7: Data Persistence', () => {
    it('should persist all trees across requests', async () => {
      const response = await request(app)
        .get('/api/trees')
        .expect(200);

      expect(response.body.trees.length).toBeGreaterThan(0);
      
      // Verify our test tree still exists with all operations
      const tree = response.body.trees.find((t: any) => t.id === treeId);
      expect(tree).toBeDefined();
      expect(tree.startingNumber).toBe(42);
      expect(tree.rootNode.children.length).toBeGreaterThan(0);
    });

    it('should maintain user accounts', async () => {
      // Try logging in again with first user
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser123',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.body.username).toBe('testuser123');
    });
  });

  describe('User Flow 8: Decimal Number Precision', () => {
    let decimalTreeId: number;
    let decimalRootNodeId: number;

    it('should handle decimal starting numbers', async () => {
      const response = await request(app)
        .post('/api/trees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ startingNumber: 10.5 })
        .expect(201);

      decimalTreeId = response.body.tree.id;
      decimalRootNodeId = response.body.tree.rootNode.id;
      expect(response.body.tree.startingNumber).toBe(10.5);
    });

    it('should maintain precision in addition with decimals', async () => {
      const response = await request(app)
        .post(`/api/trees/${decimalTreeId}/operations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentNodeId: decimalRootNodeId,
          operation: 'add',
          rightArgument: 0.3
        })
        .expect(201);

      expect(response.body.node.result).toBeCloseTo(10.8, 10);
    });

    it('should maintain precision in multiplication with decimals', async () => {
      const response = await request(app)
        .post(`/api/trees/${decimalTreeId}/operations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentNodeId: decimalRootNodeId,
          operation: 'multiply',
          rightArgument: 1.5
        })
        .expect(201);

      expect(response.body.node.result).toBeCloseTo(15.75, 10);
    });

    it('should maintain precision in division with decimals', async () => {
      const response = await request(app)
        .post(`/api/trees/${decimalTreeId}/operations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          parentNodeId: decimalRootNodeId,
          operation: 'divide',
          rightArgument: 2
        })
        .expect(201);

      expect(response.body.node.result).toBeCloseTo(5.25, 10);
    });
  });
});
