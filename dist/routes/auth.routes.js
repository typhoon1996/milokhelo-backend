"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// POST /auth/register
router.post('/register', [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
], auth_controller_1.registerUser);
// POST /auth/login
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
], auth_controller_1.loginUser);
router.post('/refresh-token', auth_controller_1.refreshAccessToken);
router.post('/login', auth_controller_1.loginUser);
router.post('/logout', auth_controller_1.logoutUser);
router.get('/me', auth_controller_1.getCurrentUser);
// OAuth routes
router.get('/google', auth_controller_1.googleAuthRedirect);
router.get('/google/callback', auth_controller_1.googleCallback);
router.get('/facebook', auth_controller_1.facebookAuthRedirect);
router.get('/facebook/callback', auth_controller_1.facebookCallback);
exports.default = router;
