"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Submit review + AI feedback for a completed match
router.post('/match/:matchId', auth_middleware_1.authenticateJWT, review_controller_1.submitMatchReview);
exports.default = router;
