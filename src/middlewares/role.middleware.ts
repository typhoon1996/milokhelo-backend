import { Request, Response, NextFunction } from "express";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user; // from JWT middleware
  if (!user || !user.isAdmin) {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};
