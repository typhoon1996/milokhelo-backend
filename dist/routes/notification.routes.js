"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Get all notifications for the current user
router.get('/', auth_middleware_1.authenticateJWT, notification_controller_1.getUserNotifications);
// Mark notifications as read
router.post('/mark-read', auth_middleware_1.authenticateJWT, notification_controller_1.markNotificationsRead);
exports.default = router;
