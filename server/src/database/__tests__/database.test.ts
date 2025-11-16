import * as fs from 'fs';
import * as path from 'path';
import { initializeDatabase, closeDatabase } from '../connection';
import * as userRepository from '../repositories/userRepository';
import * as treeRepository from '../repositories/treeRepository';
import * as nodeRepository from '../repositories/nodeRepository';

const TEST_DB_PATH = path.join(__dirname, '../../../data/test-database.sqlite');

describe('Database Operations', () => {
  beforeEach(async () => {
    // Set test database path
    process.env.DATABASE_PATH = TEST_DB_PATH;
    
    // Remove existing test database if it exists
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    
    // Initialize database
    await initializeDatabase();
  });

  afterEach(async () => {
    await closeDatabase();
    
    // Clean up test database
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  describe('User Repository', () => {
    test('should create a new user', async () => {
      const userId = await userRepository.createUser('testuser', 'hashedpassword123');
      expect(userId).toBeGreaterThan(0);
    });

    test('should find user by username', async () => {
      await userRepository.createUser('findme', 'password456');
      const user = await userRepository.findUserByUsername('findme');
      
      expect(user).not.toBeNull();
      expect(user?.username).toBe('findme');
      expect(user?.password_hash).toBe('password456');
    });

    test('should find user by id', async () => {
      const userId = await userRepository.createUser('findbyid', 'password789');
      const user = await userRepository.findUserById(userId);
      
      expect(user).not.toBeNull();
      expect(user?.id).toBe(userId);
      expect(user?.username).toBe('findbyid');
    });

    test('should return null for non-existent username', async () => {
      const user = await userRepository.findUserByUsername('nonexistent');
      expect(user).toBeNull();
    });
  });

  describe('Tree and Node Repository', () => {
    test('should create a tree with root node', async () => {
      const testUserId = await userRepository.createUser('treeuser', 'treepass');
      const treeId = await treeRepository.createTree(42, testUserId);
      expect(treeId).toBeGreaterThan(0);
      
      // Verify root node was created
      const nodes = await nodeRepository.findNodesByTreeId(treeId);
      expect(nodes.length).toBe(1);
      expect(nodes[0].result).toBe(42);
      expect(nodes[0].parentNodeId).toBeNull();
    });

    test('should create nodes with parent relationships', async () => {
      const testUserId = await userRepository.createUser('treeuser2', 'treepass');
      const treeId = await treeRepository.createTree(10, testUserId);
      const rootNodes = await nodeRepository.findNodesByTreeId(treeId);
      const rootNodeId = rootNodes[0].id;
      
      // Add operation: 10 + 5 = 15
      const childNodeId = await nodeRepository.createNode(
        treeId,
        rootNodeId,
        'add',
        5,
        15,
        testUserId
      );
      
      expect(childNodeId).toBeGreaterThan(0);
      
      const nodes = await nodeRepository.findNodesByTreeId(treeId);
      expect(nodes.length).toBe(1); // Root node
      expect(nodes[0].children.length).toBe(1); // Child node
      expect(nodes[0].children[0].result).toBe(15);
      expect(nodes[0].children[0].operation).toBe('add');
    });

    test('should load tree with all nodes recursively', async () => {
      const testUserId = await userRepository.createUser('treeuser3', 'treepass');
      const treeId = await treeRepository.createTree(100, testUserId);
      const rootNodes = await nodeRepository.findNodesByTreeId(treeId);
      const rootNodeId = rootNodes[0].id;
      
      // Create first level: 100 + 20 = 120
      const child1Id = await nodeRepository.createNode(treeId, rootNodeId, 'add', 20, 120, testUserId);
      
      // Create second level: 120 * 2 = 240
      await nodeRepository.createNode(treeId, child1Id, 'multiply', 2, 240, testUserId);
      
      // Create another first level: 100 - 30 = 70
      await nodeRepository.createNode(treeId, rootNodeId, 'subtract', 30, 70, testUserId);
      
      const tree = await treeRepository.findTreeById(treeId);
      
      expect(tree).not.toBeNull();
      expect(tree?.rootNode.result).toBe(100);
      expect(tree?.rootNode.children.length).toBe(2);
      
      // Check first branch
      const firstChild = tree?.rootNode.children.find(c => c.operation === 'add');
      expect(firstChild?.result).toBe(120);
      expect(firstChild?.children.length).toBe(1);
      expect(firstChild?.children[0].result).toBe(240);
      
      // Check second branch
      const secondChild = tree?.rootNode.children.find(c => c.operation === 'subtract');
      expect(secondChild?.result).toBe(70);
    });

    test('should find all trees', async () => {
      const testUserId = await userRepository.createUser('treeuser4', 'treepass');
      const user2Id = await userRepository.createUser('user2', 'pass2');
      
      await treeRepository.createTree(5, testUserId);
      await treeRepository.createTree(10, user2Id);
      
      const trees = await treeRepository.findAllTrees();
      
      expect(trees.length).toBeGreaterThanOrEqual(2);
      expect(trees.every(t => t.rootNode !== null)).toBe(true);
    });
  });
});
