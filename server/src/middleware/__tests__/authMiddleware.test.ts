import { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../authMiddleware';
import { generateToken } from '../../services/authService';

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    nextFunction = jest.fn();
  });

  test('should call next() with valid token', () => {
    const token = generateToken(1, 'testuser');
    mockRequest.headers = {
      authorization: `Bearer ${token}`
    };

    authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockRequest.user).toBeDefined();
    expect(mockRequest.user?.userId).toBe(1);
    expect(mockRequest.user?.username).toBe('testuser');
  });

  test('should return 401 when no token provided', () => {
    mockRequest.headers = {};

    authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'No token provided'
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should return 401 when authorization header has no Bearer prefix', () => {
    const token = generateToken(1, 'testuser');
    mockRequest.headers = {
      authorization: token // Missing "Bearer " prefix
    };

    authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
      message: 'No token provided'
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should return 401 with invalid token', () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid.token.here'
    };

    authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalled();
    expect(nextFunction).not.toHaveBeenCalled();
  });

  test('should return 401 with malformed token', () => {
    mockRequest.headers = {
      authorization: 'Bearer malformed'
    };

    authenticateToken(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
