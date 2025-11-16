import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../services/authService';

// Extend Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware to verify JWT token and attach user info to request
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({ error: 'Unauthorized', message: 'Token expired' });
        return;
      }
      if (error.name === 'JsonWebTokenError') {
        res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
        return;
      }
    }
    res.status(401).json({ error: 'Unauthorized', message: 'Authentication failed' });
  }
}
