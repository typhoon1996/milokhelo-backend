"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Suggested users (Requires Auth)
router.get('/suggested', auth_middleware_1.authenticateJWT, user_controller_1.getSuggestedUsers);
// Send connection request to another user (Requires Auth)
router.post('/connections/:userId', auth_middleware_1.authenticateJWT, user_controller_1.sendConnectionRequest);
exports.default = router;
