import { Router } from "express";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getCurrentUser,
  googleAuthRedirect,
  googleCallback,
  facebookAuthRedirect,
  facebookCallback,
} from "../controllers/auth.controller";
import { body } from "express-validator";
import { authenticateJWT } from "../middlewares/auth.middleware"; // ✅ add this

const router = Router();

// Register
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  registerUser
);

// Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  loginUser
);

// Token and logout
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logoutUser);

// ✅ Protect this route with JWT middleware
router.get("/me", authenticateJWT, getCurrentUser);

// OAuth (stubbed)
router.get("/google", googleAuthRedirect);
router.get("/google/callback", googleCallback);
router.get("/facebook", facebookAuthRedirect);
router.get("/facebook/callback", facebookCallback);

export default router;
