import { Router, Request, Response } from 'express';
import { register, login } from '../services/authService';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Username and password are required'
      });
      return;
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Username and password must be strings'
      });
      return;
    }

    if (username.trim().length === 0) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Username cannot be empty'
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Password must be at least 6 characters long'
      });
      return;
    }

    // Register user
    const result = await register(username.trim(), password);

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.userId,
      token: result.token,
      username: result.username
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Username already exists') {
        res.status(409).json({
          error: 'ConflictError',
          message: error.message
        });
        return;
      }
    }
    throw error;
  }
});

/**
 * POST /api/auth/login
 * Login a user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Username and password are required'
      });
      return;
    }

    if (typeof username !== 'string' || typeof password !== 'string') {
      res.status(400).json({
        error: 'ValidationError',
        message: 'Username and password must be strings'
      });
      return;
    }

    // Login user
    const result = await login(username, password);

    res.status(200).json({
      token: result.token,
      username: result.username,
      userId: result.userId
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Invalid username or password') {
        res.status(401).json({
          error: 'AuthenticationError',
          message: error.message
        });
        return;
      }
    }
    throw error;
  }
});

export default router;
