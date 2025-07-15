import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { User } from "../models/User";
import { Connection } from "../models/Connection";
import { Op } from "sequelize";
/**
 * User Controller
 * Handles user-related operations such as fetching user details, suggested users,
 * sending connection requests, and managing connections.
 */
export const getSuggestedUsers = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const currentUserId = req.user?.id;

    // Get current user's connections (you'll replace this with real logic later)
    const existingConnectionIds: string[] = []; // TODO: Fetch from DB

    // Fetch users excluding current user and their existing connections
    const users = await User.findAll({
      where: {
        id: {
          [Op.notIn]: [currentUserId, ...existingConnectionIds],
        },
      },
      limit: 10,
    });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendConnectionRequest = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const requesterId = req.user?.id!;
    const receiverId = req.params.userId;

    if (requesterId === receiverId) {
      return res
        .status(400)
        .json({ message: "You cannot connect with yourself." });
    }

    // Check if already exists
    const existing = await Connection.findOne({
      where: {
        requesterId,
        receiverId,
      },
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: "Connection already exists or pending." });
    }

    // Create connection request
    const connection = await Connection.create({
      requesterId,
      receiverId,
      status: "pending",
    });

    res.status(200).json({ status: connection.status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getConnections = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id!;

    const connections = await Connection.findAll({
      where: {
        [Op.or]: [{ requesterId: userId }, { targetId: userId }],
      },
      include: [
        { model: User, as: "requester", attributes: ["id", "name", "email"] },
        { model: User, as: "target", attributes: ["id", "name", "email"] },
      ],
    });

    const formatted = connections.map((conn) => {
      const isRequester = conn.requesterId === userId;
      const otherUser = isRequester ? conn.target : conn.requester;

      return {
        id: conn.id,
        user: otherUser,
        direction: isRequester ? "sent" : "received",
        status: conn.status,
      };
    });

    res.status(200).json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const acceptConnection = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.userId!;
    const connectionId = req.params.id;

    const connection = await Connection.findByPk(connectionId);

    if (!connection || connection.targetId !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to accept this request." });
    }

    connection.status = "accepted";
    await connection.save();

    res.status(200).json({ status: "accepted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const rejectConnection = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id!;
    const connectionId = req.params.id;

    const connection = await Connection.findByPk(connectionId);

    if (!connection || connection.targetId !== userId) {
      return res
        .status(403)
        .json({ message: "Not authorized to reject this request." });
    }

    connection.status = "rejected";
    await connection.save();

    res.status(200).json({ status: "rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const preferences = async (req: AuthenticatedRequest, res: Response) => {
  const user = await User.findByPk(req.user?.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const { receiveMatchReminders, receiveEmailNotifications } = req.body;

  if (receiveMatchReminders !== undefined)
    user.receiveMatchReminders = receiveMatchReminders;
  if (receiveEmailNotifications !== undefined)
    user.receiveEmailNotifications = receiveEmailNotifications;

  await user.save();
  return res.status(200).json({ message: "Preferences updated" });
};
