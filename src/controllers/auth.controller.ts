import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { generateAccessToken } from "../utils/jwt";
import { RefreshTokenService } from "../services/refreshToken.service";
import { body, validationResult } from "express-validator";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { catchAsync } from "../utils/catchAsync";
import { ValidationError, ConflictError, UnauthorizedError, NotFoundError } from "../utils/AppError";

export const registerUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed');
  }

  const { name, email, password } = req.body;

  // Check if user exists
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new ConflictError("Email already in use");
  }

  // Create user
  const user = await User.create({ name, email, password });

  // Create JWT
  const accessToken = generateAccessToken(user.id);

  // Create refresh token using service
  const refreshTokenData = await RefreshTokenService.createToken(user.id);

  res
    .cookie("refreshToken", refreshTokenData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(201)
    .json({ 
      success: true,
      accessToken, 
      user 
    });
});

export const loginUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed');
  }

  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid credentials");
  }

  const accessToken = generateAccessToken(user.id);

  // Create refresh token using service
  const refreshTokenData = await RefreshTokenService.createToken(user.id);

  res
    .cookie("refreshToken", refreshTokenData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({ 
      success: true,
      accessToken, 
      user 
    });
});

export const refreshAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    throw new UnauthorizedError("No refresh token");
  }

  // Validate token using service
  const tokenValidation = await RefreshTokenService.validateToken(token);
  if (!tokenValidation) {
    throw new UnauthorizedError("Invalid or expired token");
  }

  const { user } = tokenValidation;

  // Generate new access token
  const accessToken = generateAccessToken(user.id);

  // Rotate refresh token (invalidate old, create new)
  const newRefreshTokenData = await RefreshTokenService.rotateToken(token);

  // Set new refresh token cookie
  res
    .cookie("refreshToken", newRefreshTokenData.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({ 
      success: true,
      accessToken 
    });
});

export const logoutUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.refreshToken;
  
  if (token) {
    // Revoke the refresh token in database
    await RefreshTokenService.revokeToken(token, "logout");
  }

  // Clear the cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
});

export const logoutAllDevices = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user?.id) {
    throw new UnauthorizedError("User not authenticated");
  }

  // Revoke all refresh tokens for the user
  const revokedCount = await RefreshTokenService.revokeAllUserTokens(req.user.id, "logout_all");

  // Clear the current cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({ 
    success: true,
    message: "Logged out from all devices", 
    revokedCount 
  });
});

export const getActiveSessions = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user?.id) {
    throw new UnauthorizedError("User not authenticated");
  }

  const activeTokens = await RefreshTokenService.getUserActiveTokens(req.user.id);
  
  const sessions = activeTokens.map(token => ({
    id: token.id,
    createdAt: token.createdAt,
    expiresAt: token.expiresAt,
    deviceInfo: token.revokedReason || "Unknown", // Could be enhanced with device fingerprinting
  }));

  res.status(200).json({ 
    success: true,
    sessions 
  });
});

export const revokeSession = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user?.id) {
    throw new UnauthorizedError("User not authenticated");
  }

  const { sessionId } = req.params;
  
  // Find the token and verify it belongs to the user
  const token = await RefreshTokenService.getUserActiveTokens(req.user.id);
  const targetToken = token.find(t => t.id === sessionId);
  
  if (!targetToken) {
    throw new NotFoundError("Session not found");
  }

  // Revoke the specific session
  await RefreshTokenService.revokeToken(targetToken.token, "manual_revoke");

  res.status(200).json({ 
    success: true,
    message: "Session revoked successfully" 
  });
});

export const getCurrentUser = catchAsync(async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  console.log("💡 In getCurrentUser - req.user:", req.user); // ✅ must NOT be undefined

  const user = await User.findByPk(req.user?.id);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  res.status(200).json({
    success: true,
    user
  });
});

export const googleAuthRedirect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.status(501).json({ 
    success: false,
    message: "Not implemented: googleAuthRedirect" 
  });
});

export const googleCallback = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.status(501).json({ 
    success: false,
    message: "Not implemented: googleCallback" 
  });
});

export const facebookAuthRedirect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.status(501).json({ 
    success: false,
    message: "Not implemented: facebookAuthRedirect" 
  });
});

export const facebookCallback = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.status(501).json({ 
    success: false,
    message: "Not implemented: facebookCallback" 
  });
});
