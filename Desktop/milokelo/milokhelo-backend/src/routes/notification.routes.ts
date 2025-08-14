import { Router } from "express";
import {
  getNotifications,
  markNotificationsRead,
} from "../controllers/notification.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

// Get all notifications for the current user
router.get("/", authenticateJWT, getNotifications);

// Mark notifications as read
router.post("/mark-read", authenticateJWT, markNotificationsRead);

export default router;
