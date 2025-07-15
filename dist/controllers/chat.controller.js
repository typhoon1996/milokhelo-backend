"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMessagesInConversation = exports.getUserConversations = void 0;
const getUserConversations = async (req, res) => {
    res.status(501).json({ message: 'Not implemented: getUserConversations' });
};
exports.getUserConversations = getUserConversations;
const getMessagesInConversation = async (req, res) => {
    res.status(501).json({ message: 'Not implemented: getMessagesInConversation' });
};
exports.getMessagesInConversation = getMessagesInConversation;
