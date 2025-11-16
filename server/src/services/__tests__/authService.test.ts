import * as fs from 'fs';
import * as path from 'path';
import { initializeDatabase, closeDatabase } from '../../database/connection';
import * as authService from '../authService';
import * as userRepository from '../../database/repositories/userRepository';

const TEST_DB_PATH = path.join(__dirname, '../../../data/test-auth.sqlite');

describe('Authentication Service', () => {
  beforeEach(async () => {
    process.env.DATABASE_PATH = TEST_DB_PATH;
    
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
    
    await initializeDatabase();
  });

  afterEach(async () => {
    await closeDatabase();
    
    if (fs.existsSync(TEST_DB_PATH)) {
      fs.unlinkSync(TEST_DB_PATH);
    }
  });

  describe('Password Hashing', () => {
    test('should hash a password', async () => {
      const password = 'mySecurePassword123';
      const hash = await authService.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    test('should verify correct password', async () => {
      const password = 'testPassword456';
      const hash = await authService.hashPassword(password);
      const isValid = await authService.verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const password = 'correctPassword';
      const hash = await authService.hashPassword(password);
      const isValid = await authService.verifyPassword('wrongPassword', hash);
      
      expect(isValid).toBe(false);
    });
  });

  describe('JWT Token Generation and Validation', () => {
    test('should generate a valid JWT token', () => {
      const token = authService.generateToken(1, 'testuser');
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    test('should verify and decode a valid token', () => {
      const userId = 42;
      const username = 'johndoe';
      const token = authService.generateToken(userId, username);
      
      const payload = authService.verifyToken(token);
      
      expect(payload.userId).toBe(userId);
      expect(payload.username).toBe(username);
    });

    test('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => authService.verifyToken(invalidToken)).toThrow();
    });
  });

  describe('User Registration', () => {
    test('should register a new user successfully', async () => {
      const result = await authService.register('newuser', 'password123');
      
      expect(result.username).toBe('newuser');
      expect(result.userId).toBeGreaterThan(0);
      expect(result.token).toBeDefined();
      
      // Verify user was created in database
      const user = await userRepository.findUserByUsername('newuser');
      expect(user).not.toBeNull();
      expect(user?.username).toBe('newuser');
    });

    test('should reject password shorter than 6 characters', async () => {
      await expect(authService.register('user', 'short')).rejects.toThrow(
        'Password must be at least 6 characters long'
      );
    });

    test('should reject duplicate username', async () => {
      await authService.register('duplicate', 'password123');
      
      await expect(authService.register('duplicate', 'password456')).rejects.toThrow(
        'Username already exists'
      );
    });
  });

  describe('User Login', () => {
    test('should login with correct credentials', async () => {
      // Register a user first
      await authService.register('loginuser', 'password123');
      
      // Login with same credentials
      const result = await authService.login('loginuser', 'password123');
      
      expect(result.username).toBe('loginuser');
      expect(result.userId).toBeGreaterThan(0);
      expect(result.token).toBeDefined();
    });

    test('should reject login with non-existent username', async () => {
      await expect(authService.login('nonexistent', 'password')).rejects.toThrow(
        'Invalid username or password'
      );
    });

    test('should reject login with incorrect password', async () => {
      await authService.register('testuser', 'correctPassword');
      
      await expect(authService.login('testuser', 'wrongPassword')).rejects.toThrow(
        'Invalid username or password'
      );
    });
  });
});
