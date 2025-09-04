import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/AppError";

interface ValidationErrorItem {
  path: string;
  message: string;
  value?: unknown;
}

interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  status: string;
  stack?: string;
  errors?: ValidationErrorItem[];
  timestamp: string;
  path: string;
}

/**
 * Type guard for checking if error has a status field
 */
function hasStatus(err: unknown): err is { status: number } {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof (err as { status?: unknown }).status === "number"
  );
}

/**
 * Global error handling middleware
 */
/**
 * Global error handling middleware
 * @param err - The error object
 * @param req - Express request object
 * @param res - Express response object
 * @param _next - Express next function (unused in error handling middleware)
 */
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction, // Unused parameter - kept for Express middleware signature
) => {
  let error: AppError;

  if (err instanceof AppError) {
    error = new AppError(err.message, err.statusCode);
    error.status = err.status;
    error.errors = err.errors;
  } else if (err instanceof Error) {
    error = new AppError(err.message, (err as { statusCode?: number }).statusCode ?? 500);
    error.name = err.name;
    error.stack = err.stack;
    Object.assign(error, err);
  } else {
    error = new AppError("Unknown error", 500);
  }

  // Log error details
  logError(err, req);

  // Sequelize validation errors
  if ((err as { name?: string }).name === "SequelizeValidationError") {
    const seErrors = (err as { errors: ValidationErrorItem[] }).errors ?? [];
    error = new AppError("Validation failed", 400);
    error.errors = seErrors.map((e) => ({
      field: e.path,
      message: e.message,
      value: e.value,
    }));
  }

  if ((err as { name?: string }).name === "SequelizeUniqueConstraintError") {
    const seErrors = (err as { errors: ValidationErrorItem[] }).errors ?? [];
    error = new AppError("Duplicate field value", 409);
    error.errors = seErrors.map((e) => ({
      field: e.path,
      message: `${e.path} already exists`,
      value: e.value,
    }));
  }

  if ((err as { name?: string }).name === "SequelizeForeignKeyConstraintError") {
    error = new AppError("Referenced resource does not exist", 400);
  }

  if (
    (err as { name?: string }).name === "SequelizeConnectionError" ||
    (err as { name?: string }).name === "SequelizeHostNotFoundError"
  ) {
    error = new AppError("Database connection failed", 503);
  }

  // JWT errors
  if ((err as { name?: string }).name === "JsonWebTokenError") {
    error = new AppError("Invalid token", 401);
  }

  if ((err as { name?: string }).name === "TokenExpiredError") {
    error = new AppError("Token expired", 401);
  }

  // Multer errors
  if ((err as { code?: string }).code === "LIMIT_FILE_SIZE") {
    error = new AppError("File too large", 400);
  }

  if ((err as { code?: string }).code === "LIMIT_UNEXPECTED_FILE") {
    error = new AppError("Unexpected file field", 400);
  }

  // Rate limiting
  if (hasStatus(err) && err.status === 429) {
    error = new AppError("Too many requests, please try again later", 429);
  }

  // JSON parsing
  if ((err as { type?: string }).type === "entity.parse.failed") {
    error = new AppError("Invalid JSON payload", 400);
  }

  // Required fields
  if ((err as { message?: string }).message?.includes("required")) {
    error = new AppError("Missing required fields", 400);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";
  const status = error.status || "error";

  const errorResponse: ErrorResponse = {
    success: false,
    statusCode,
    message,
    status,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  };

  if (error.errors && Array.isArray(error.errors)) {
    errorResponse.errors = error.errors as ValidationErrorItem[];
  }

  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Log error details based on environment
 */
function logError(err: unknown, req: Request): void {
  const isDev = process.env.NODE_ENV === "development";
  if (!(err instanceof Error)) return;

  if (isDev) {
    console.error("🔥 Error Details:", {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      body: req.body,
      query: req.query,
      params: req.params,
      headers: req.headers,
      timestamp: new Date().toISOString(),
    });
  } else {
    console.error("🔥 Error:", {
      message: err.message,
      statusCode: (err as { statusCode?: number }).statusCode ?? 500,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * 404 handler
 */
export const notFound = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route ${req.originalUrl} not found`,
    status: "fail",
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
};

/**
 * Handle unhandled promise rejections
 */
export const handleUnhandledRejection = (err: Error) => {
  console.error("🔥 Unhandled Promise Rejection:", err);
  console.error("Stack:", err.stack);
  throw err; // ✅ no process.exit
};

/**
 * Handle uncaught exceptions
 */
export const handleUncaughtException = (err: Error) => {
  console.error("🔥 Uncaught Exception:", err);
  console.error("Stack:", err.stack);
  throw err; // ✅ no process.exit
};
