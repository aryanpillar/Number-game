import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, findUserByUsername } from '../database/repositories/userRepository';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRATION = '24h';

export interface AuthResponse {
  token: string;
  username: string;
  userId: number;
}

export interface TokenPayload {
  userId: number;
  username: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(userId: number, username: string): string {
  const payload: TokenPayload = { userId, username };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

/**
 * Register a new user
 */
export async function register(username: string, password: string): Promise<AuthResponse> {
  // Validate password length
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  // Check if username already exists
  const existingUser = await findUserByUsername(username);
  if (existingUser) {
    throw new Error('Username already exists');
  }

  // Hash password and create user
  const passwordHash = await hashPassword(password);
  const userId = await createUser(username, passwordHash);

  // Generate token
  const token = generateToken(userId, username);

  return {
    token,
    username,
    userId
  };
}

/**
 * Login a user
 */
export async function login(username: string, password: string): Promise<AuthResponse> {
  // Find user by username
  const user = await findUserByUsername(username);
  if (!user) {
    throw new Error('Invalid username or password');
  }

  // Verify password
  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid username or password');
  }

  // Generate token
  const token = generateToken(user.id, user.username);

  return {
    token,
    username: user.username,
    userId: user.id
  };
}
