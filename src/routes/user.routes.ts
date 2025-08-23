import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  getSuggestedUsers,
  sendConnectionRequest,
  getConnections,
  acceptConnection,
  rejectConnection,
  getUserProfile,
  updateUserProfile,
  preferences,
} from "../controllers/user.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

// Profile endpoints (Requires Auth)
router.get("/profile", authenticateJWT, getUserProfile);
router.put("/profile", 
  [
    body("name").optional().isString().trim().isLength({ min: 1 }).withMessage("Name must be a non-empty string"),
    body("email").optional().isEmail().withMessage("Valid email is required")
  ],
  authenticateJWT, 
  updateUserProfile
);

// Suggested users (Requires Auth)
router.get("/suggested", 
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50"),
    query("search").optional().isString().trim().isLength({ min: 1 }).withMessage("Search must be a non-empty string")
  ],
  authenticateJWT, 
  getSuggestedUsers
);

// Send connection request to another user (Requires Auth)
router.post("/connections/:userId", 
  [
    param("userId").isUUID().withMessage("Valid user ID is required")
  ],
  authenticateJWT, 
  sendConnectionRequest
);

router.get("/connections", authenticateJWT, getConnections);
router.post("/connections/:id/accept", 
  [
    param("id").isUUID().withMessage("Valid connection ID is required")
  ],
  authenticateJWT, 
  acceptConnection
);
router.post("/connections/:id/reject", 
  [
    param("id").isUUID().withMessage("Valid connection ID is required")
  ],
  authenticateJWT, 
  rejectConnection
);
router.put("/preferences", 
  [
    body("receiveMatchReminders").optional().isBoolean().withMessage("receiveMatchReminders must be a boolean"),
    body("receiveEmailNotifications").optional().isBoolean().withMessage("receiveEmailNotifications must be a boolean")
  ],
  authenticateJWT, 
  preferences
);
export default router;
