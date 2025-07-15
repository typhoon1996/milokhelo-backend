import { Router } from "express";
import {
  getSuggestedUsers,
  sendConnectionRequest,
  getConnections,
  acceptConnection,
  rejectConnection,
  preferences,
} from "../controllers/user.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

// Suggested users (Requires Auth)
router.get("/suggested", authenticateJWT, getSuggestedUsers);

// Send connection request to another user (Requires Auth)
router.post("/connections/:userId", authenticateJWT, sendConnectionRequest);

router.get("/connections", authenticateJWT, getConnections);
router.post("/connections/:id/accept", authenticateJWT, acceptConnection);
router.post("/connections/:id/reject", authenticateJWT, rejectConnection);
router.put("/preferences", authenticateJWT, preferences);
export default router;
