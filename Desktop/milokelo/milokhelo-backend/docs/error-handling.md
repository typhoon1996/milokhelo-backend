# Centralized Error Handling System

This document describes the comprehensive error handling system implemented in the MiloKhelo backend to provide consistent error responses and proper error logging across the application.

## Overview

The error handling system consists of several components that work together to:
- Catch and handle all errors (both synchronous and asynchronous)
- Provide consistent JSON error responses
- Log errors appropriately based on environment
- Handle specific error types (validation, database, JWT, etc.)
- Prevent unhandled promise rejections and exceptions

## Components

### 1. Custom Error Classes (`utils/AppError.ts`)

The system provides a hierarchy of custom error classes for different types of errors:

```typescript
// Base error class
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: string;
  public readonly isOperational: boolean;
}

// Specific error types
export class ValidationError extends AppError {}      // 400
export class UnauthorizedError extends AppError {}   // 401
export class ForbiddenError extends AppError {}      // 403
export class NotFoundError extends AppError {}       // 404
export class ConflictError extends AppError {}       // 409
export class TooManyRequestsError extends AppError {} // 429
export class InternalServerError extends AppError {}  // 500
export class ServiceUnavailableError extends AppError {} // 503
```

#### Usage Example:
```typescript
// Instead of returning error responses manually
if (!user) {
  return res.status(404).json({ message: "User not found" });
}

// Throw custom errors
if (!user) {
  throw new NotFoundError("User not found");
}
```

### 2. Async Error Wrapper (`utils/catchAsync.ts`)

The `catchAsync` utility wraps async controller functions to automatically catch errors and forward them to the global error handler:

```typescript
// Before (with try-catch)
export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

// After (with catchAsync)
export const getUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findByPk(req.params.id);
  if (!user) throw new NotFoundError('User not found');
  res.json({ success: true, user });
});
```

### 3. Global Error Handler (`middlewares/errorHandler.ts`)

The central error handling middleware processes all errors and provides consistent responses:

#### Error Response Format:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "status": "fail",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/users",
  "errors": [
    {
      "field": "email",
      "message": "Email is required",
      "value": null
    }
  ],
  "stack": "Error stack trace (development only)"
}
```

#### Handled Error Types:
- **Sequelize Errors**: Validation, unique constraints, foreign keys, connection issues
- **JWT Errors**: Invalid tokens, expired tokens
- **File Upload Errors**: File size limits, unexpected fields
- **Rate Limiting**: Too many requests
- **Validation Errors**: Missing fields, invalid JSON
- **Custom AppErrors**: Application-specific errors

### 4. Global Error Handling

The system handles unhandled promise rejections and uncaught exceptions:

```typescript
// In app.ts
process.on('unhandledRejection', handleUnhandledRejection);
process.on('uncaughtException', handleUncaughtException);
```

## Implementation in Controllers

### Before (Traditional Error Handling):
```typescript
export const createUser = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email } = req.body;
    const existing = await User.findOne({ where: { email } });
    
    if (existing) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const user = await User.create({ name, email });
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
```

### After (Centralized Error Handling):
```typescript
export const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed');
  }

  const { name, email } = req.body;
  const existing = await User.findOne({ where: { email } });
  
  if (existing) {
    throw new ConflictError("Email already exists");
  }

  const user = await User.create({ name, email });
  res.status(201).json({ success: true, user });
});
```

## Error Logging

### Development Mode:
- Detailed error information including stack traces
- Request details (URL, method, headers, body, etc.)
- Full error context for debugging

### Production Mode:
- Minimal error details for security
- Essential information for monitoring
- No sensitive data exposure

## Best Practices

### 1. Use Custom Error Classes
```typescript
// Good
if (!user) throw new NotFoundError("User not found");

// Avoid
if (!user) return res.status(404).json({ message: "User not found" });
```

### 2. Wrap All Async Controllers
```typescript
// Good
export const getUser = catchAsync(async (req, res, next) => {
  // Controller logic
});

// Avoid
export const getUser = async (req, res) => {
  try {
    // Controller logic
  } catch (error) {
    // Manual error handling
  }
};
```

### 3. Consistent Response Format
```typescript
// Success responses
res.json({ success: true, data: result });

// Error responses (handled automatically)
throw new ValidationError("Invalid input");
```

### 4. Proper HTTP Status Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resources)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error (server errors)

## Error Handling Flow

1. **Controller Function** throws an error or calls `next(error)`
2. **catchAsync Wrapper** catches async errors and forwards to `next()`
3. **Global Error Handler** processes the error
4. **Error Response** is sent with consistent format
5. **Error Logging** occurs based on environment

## Testing Error Handling

### Test Custom Errors:
```typescript
import { NotFoundError } from '../utils/AppError';

test('should throw NotFoundError for missing user', () => {
  expect(() => {
    throw new NotFoundError('User not found');
  }).toThrow(NotFoundError);
});
```

### Test Error Responses:
```typescript
test('should return 404 for missing user', async () => {
  const response = await request(app)
    .get('/api/users/nonexistent')
    .expect(404);
  
  expect(response.body.success).toBe(false);
  expect(response.body.statusCode).toBe(404);
});
```

## Monitoring and Debugging

### Development Tools:
- Detailed error logs with stack traces
- Request context information
- Interactive debugging support

### Production Monitoring:
- Error rate tracking
- Performance impact monitoring
- Alert systems for critical errors
- Structured logging for analysis

## Future Enhancements

1. **Error Reporting**: Integration with external error tracking services
2. **Metrics**: Error rate and performance metrics collection
3. **Alerting**: Automated alerts for critical errors
4. **Error Recovery**: Automatic retry mechanisms for transient errors
5. **User Feedback**: User-friendly error messages for common issues

## Migration Guide

### Step 1: Update Imports
```typescript
import { catchAsync } from '../utils/catchAsync';
import { ValidationError, NotFoundError } from '../utils/AppError';
```

### Step 2: Wrap Controllers
```typescript
// Before
export const getUser = async (req, res) => { ... };

// After
export const getUser = catchAsync(async (req, res, next) => { ... });
```

### Step 3: Replace Error Responses
```typescript
// Before
if (!user) return res.status(404).json({ message: "Not found" });

// After
if (!user) throw new NotFoundError("User not found");
```

### Step 4: Remove Try-Catch Blocks
```typescript
// Before
try {
  // logic
} catch (error) {
  res.status(500).json({ message: "Error" });
}

// After
// logic (errors automatically handled)
```

This centralized error handling system provides a robust, maintainable, and consistent approach to error management across the entire application.
