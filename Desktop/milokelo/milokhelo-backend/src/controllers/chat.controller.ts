import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Participant } from "../models/Participant";
import { Conversation } from "../models/Conversation";
import { Message } from "../models/Message";
import { User } from "../models/User";

export const getConversations = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const userId = req.user?.id!;
  try {
    const participantConversations = await Participant.findAll({
      where: { userId },
      include: [Conversation],
    });
    const conversations = participantConversations.map((p) => p.id);
    res.status(200).json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessages = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id!;
  const conversationId = req.params.id;
  try {
    const isParticipant = await Participant.findOne({
      where: { userId, conversationId },
    });
    if (!isParticipant) {
      return res.status(403).json({ message: "Not authorized" });
    }
    const messages = await Message.findAll({
      where: { conversationId },
      order: [["createdAt", "ASC"]],
      include: [{ model: User, attributes: ["id", "name"] }],
    });
    res.status(200).json({ data: messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const resetUnreadCount = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { conversationId } = req.params;

  await Participant.update(
    { unreadCount: 0 },
    { where: { userId: req.user?.id, conversationId } }
  );

  res.status(200).json({ message: "Unread count reset" });
};
