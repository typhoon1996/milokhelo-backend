import { Request, Response, NextFunction } from 'express';

type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

/**
 * Wraps async functions to catch errors and forward them to Express error handling middleware
 * This eliminates the need for try-catch blocks in controllers
 * 
 * @param fn - The async function to wrap
 * @returns A wrapped function that catches errors and passes them to next()
 * 
 * @example
 * // Instead of:
 * export const getUser = async (req: Request, res: Response) => {
 *   try {
 *     const user = await User.findByPk(req.params.id);
 *     if (!user) return res.status(404).json({ message: 'User not found' });
 *     res.json(user);
 *   } catch (error) {
 *     res.status(500).json({ message: 'Internal server error' });
 *   }
 * };
 * 
 * // Use:
 * export const getUser = catchAsync(async (req: Request, res: Response) => {
 *   const user = await User.findByPk(req.params.id);
 *   if (!user) throw new NotFoundError('User not found');
 *   res.json(user);
 * });
 */
export const catchAsync = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Alternative syntax for better readability
 */
export const asyncHandler = catchAsync;
