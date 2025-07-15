import { Request, Response } from "express";
import { User } from "../models/User";
import { generateAccessToken } from "../utils/jwt";
import { verifyRefreshToken, generateRefreshToken } from "../utils/jwt";
import { body, validationResult } from "express-validator";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export const registerUser = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Create JWT
    const accessToken = generateAccessToken(user.id);

    // Set refresh token cookie
    const refreshToken = generateRefreshToken(user.id);

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200) // or 201
      .json({ accessToken, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user.id);

    // Set refresh token cookie
    const refreshToken = generateRefreshToken(user.id);

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200) // or 201
      .json({ accessToken, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "No refresh token" });
    }

    let payload: any;
    try {
      payload = verifyRefreshToken(token);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findByPk(payload.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const accessToken = generateAccessToken(user.id);

    return res.status(200).json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.sendStatus(204); // No Content
};

export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    console.log("💡 In getCurrentUser - req.user:", req.user); // ✅ must NOT be undefined

    const user = await User.findByPk(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error in getCurrentUser:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const googleAuthRedirect = async (req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented: googleAuthRedirect" });
};

export const googleCallback = async (req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented: googleCallback" });
};

export const facebookAuthRedirect = async (req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented: facebookAuthRedirect" });
};

export const facebookCallback = async (req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented: facebookCallback" });
};
