"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Get all chat conversations for current user
router.get('/conversations', auth_middleware_1.authenticateJWT, chat_controller_1.getUserConversations);
// Get paginated messages in a specific conversation
router.get('/conversations/:id/messages', auth_middleware_1.authenticateJWT, chat_controller_1.getMessagesInConversation);
exports.default = router;
