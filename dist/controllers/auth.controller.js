"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.facebookCallback = exports.facebookAuthRedirect = exports.googleCallback = exports.googleAuthRedirect = exports.getCurrentUser = exports.logoutUser = exports.refreshAccessToken = exports.loginUser = exports.registerUser = void 0;
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
const jwt_2 = require("../utils/jwt");
const express_validator_1 = require("express-validator");
const registerUser = async (req, res) => {
    try {
        // Validate request
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { name, email, password } = req.body;
        // Check if user exists
        const existing = await User_1.User.findOne({ where: { email } });
        if (existing) {
            return res.status(409).json({ message: "Email already in use" });
        }
        // Create user
        const user = await User_1.User.create({ name, email, password });
        // Create JWT
        const accessToken = (0, jwt_1.generateAccessToken)(user.id);
        // Set refresh token cookie
        const refreshToken = (0, jwt_2.generateRefreshToken)(user.id);
        res
            .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
            .status(200) // or 201
            .json({ accessToken, user });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const { email, password } = req.body;
        const user = await User_1.User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const accessToken = (0, jwt_1.generateAccessToken)(user.id);
        // Set refresh token cookie
        const refreshToken = (0, jwt_2.generateRefreshToken)(user.id);
        res
            .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
            .status(200) // or 201
            .json({ accessToken, user });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.loginUser = loginUser;
const refreshAccessToken = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken;
        if (!token) {
            return res.status(401).json({ message: "No refresh token" });
        }
        let payload;
        try {
            payload = (0, jwt_2.verifyRefreshToken)(token);
        }
        catch (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        const user = await User_1.User.findByPk(payload.userId);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        const accessToken = (0, jwt_1.generateAccessToken)(user.id);
        return res.status(200).json({ accessToken });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.refreshAccessToken = refreshAccessToken;
const logoutUser = async (req, res) => {
    res.status(501).json({ message: "Not implemented: logoutUser" });
};
exports.logoutUser = logoutUser;
const getCurrentUser = async (req, res) => {
    res.status(501).json({ message: "Not implemented: getCurrentUser" });
};
exports.getCurrentUser = getCurrentUser;
const googleAuthRedirect = async (req, res) => {
    res.status(501).json({ message: "Not implemented: googleAuthRedirect" });
};
exports.googleAuthRedirect = googleAuthRedirect;
const googleCallback = async (req, res) => {
    res.status(501).json({ message: "Not implemented: googleCallback" });
};
exports.googleCallback = googleCallback;
const facebookAuthRedirect = async (req, res) => {
    res.status(501).json({ message: "Not implemented: facebookAuthRedirect" });
};
exports.facebookAuthRedirect = facebookAuthRedirect;
const facebookCallback = async (req, res) => {
    res.status(501).json({ message: "Not implemented: facebookCallback" });
};
exports.facebookCallback = facebookCallback;
