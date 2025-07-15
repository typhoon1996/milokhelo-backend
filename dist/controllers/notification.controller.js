"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationsRead = exports.getUserNotifications = void 0;
const getUserNotifications = async (req, res) => {
    res.status(501).json({ message: 'Not implemented: getUserNotifications' });
};
exports.getUserNotifications = getUserNotifications;
const markNotificationsRead = async (req, res) => {
    res.status(501).json({ message: 'Not implemented: markNotificationsRead' });
};
exports.markNotificationsRead = markNotificationsRead;
