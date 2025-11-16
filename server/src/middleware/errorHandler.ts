import { Request, Response, NextFunction } from 'express';

/**
 * Global error handler middleware for Express
 * Formats error responses consistently and logs errors
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error details
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error response
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  const errorResponse = {
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler
 * Handles requests to undefined routes
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(404).json({
    error: 'NotFoundError',
    message: `Route ${req.method} ${req.path} not found`
  });
}
