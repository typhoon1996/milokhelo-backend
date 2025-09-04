import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Type for async request handlers that automatically handles errors
 */
type AsyncRequestHandler<T = any> = (req: Request, res: Response, next: NextFunction) => Promise<T>;

/**
 * Wraps an async request handler to catch any errors and forward them to Express's error handling middleware
 * @param fn The async request handler function to wrap
 * @returns A new request handler that catches and forwards errors
 */
export const catchAsync = <T = any>(fn: AsyncRequestHandler<T>): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch((error: unknown) => {
      next(error);
    });
  };
};

/**
 * Alias for catchAsync for backward compatibility
 */
export const asyncHandler = catchAsync;
