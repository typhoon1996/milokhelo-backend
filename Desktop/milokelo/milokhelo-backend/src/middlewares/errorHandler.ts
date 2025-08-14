import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  status: string;
  stack?: string;
  errors?: any[];
  timestamp: string;
  path: string;
}

/**
 * Global error handling middleware
 * Handles all errors thrown in the application and sends consistent JSON responses
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details
  logError(err, req);

  // Handle Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const message = 'Validation failed';
    const errors = err.errors.map((e: any) => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
    error = new AppError(message, 400);
    error.errors = errors;
  }

  // Handle Sequelize unique constraint violations
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Duplicate field value';
    const errors = err.errors.map((e: any) => ({
      field: e.path,
      message: `${e.path} already exists`,
      value: e.value
    }));
    error = new AppError(message, 409);
    error.errors = errors;
  }

  // Handle Sequelize foreign key constraint violations
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Referenced resource does not exist';
    error = new AppError(message, 400);
  }

  // Handle Sequelize database connection errors
  if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeHostNotFoundError') {
    const message = 'Database connection failed';
    error = new AppError(message, 503);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401);
  }

  // Handle multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = new AppError(message, 400);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Unexpected file field';
    error = new AppError(message, 400);
  }

  // Handle rate limiting errors
  if (err.status === 429) {
    const message = 'Too many requests, please try again later';
    error = new AppError(message, 429);
  }

  // Handle validation errors from express-validator
  if (err.type === 'entity.parse.failed') {
    const message = 'Invalid JSON payload';
    error = new AppError(message, 400);
  }

  // Handle missing required fields
  if (err.message && err.message.includes('required')) {
    const message = 'Missing required fields';
    error = new AppError(message, 400);
  }

  // Set default values if not set
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const status = error.status || 'error';

  // Prepare error response
  const errorResponse: ErrorResponse = {
    success: false,
    statusCode,
    message,
    status,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  };

  // Add validation errors if they exist
  if (error.errors && Array.isArray(error.errors)) {
    errorResponse.errors = error.errors;
  }

  // Add stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Log error details based on environment
 */
function logError(err: any, req: Request): void {
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // Development: Log detailed error information
    console.error('🔥 Error Details:');
    console.error('  Message:', err.message);
    console.error('  Stack:', err.stack);
    console.error('  URL:', req.originalUrl);
    console.error('  Method:', req.method);
    console.error('  IP:', req.ip);
    console.error('  User Agent:', req.get('User-Agent'));
    console.error('  Timestamp:', new Date().toISOString());
    console.error('  Body:', req.body);
    console.error('  Query:', req.query);
    console.error('  Params:', req.params);
    console.error('  Headers:', req.headers);
    console.error('---');
  } else {
    // Production: Log minimal details for security
    console.error('🔥 Error:', {
      message: err.message,
      statusCode: err.statusCode || 500,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * 404 Not Found middleware
 */
export const notFound = (req: Request, res: Response) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route ${req.originalUrl} not found`,
    status: 'fail',
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
};

/**
 * Handle unhandled promise rejections
 */
export const handleUnhandledRejection = (err: Error) => {
  console.error('🔥 Unhandled Promise Rejection:', err);
  console.error('Stack:', err.stack);
  
  // In production, you might want to exit the process
  if (process.env.NODE_ENV === 'production') {
    console.error('🔥 Unhandled Promise Rejection detected. Exiting...');
    process.exit(1);
  }
};

/**
 * Handle uncaught exceptions
 */
export const handleUncaughtException = (err: Error) => {
  console.error('🔥 Uncaught Exception:', err);
  console.error('Stack:', err.stack);
  
  // Always exit on uncaught exceptions
  console.error('🔥 Uncaught Exception detected. Exiting...');
  process.exit(1);
};
