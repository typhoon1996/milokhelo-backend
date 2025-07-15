import { Router } from "express";
import {
  getConversations,
  getMessages,
  resetUnreadCount,
} from "../controllers/chat.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

// Get all chat conversations for current user
router.get("/conversations", authenticateJWT, getConversations);

// Get paginated messages in a specific conversation
router.get("/conversations/:id/messages", authenticateJWT, getMessages);

router.post("/:conversationId/reset-unread", authenticateJWT, resetUnreadCount);

export default router;
