import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { User } from "../models/User";
import { Connection, ConnectionStatus } from "../models/Connection";
import { Op } from "sequelize";
import { catchAsync } from "../utils/catchAsync";
import { ValidationError, ConflictError, NotFoundError } from "../utils/AppError";
/**
 * User Controller
 * Handles user-related operations such as fetching user details, suggested users,
 * sending connection requests, and managing connections.
 */
export const getSuggestedUsers = catchAsync(async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
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

  res.status(200).json({
    success: true,
    users
  });
});

export const sendConnectionRequest = catchAsync(async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const requesterId = req.user?.id!;
  const receiverId = req.params.userId;

  if (requesterId === receiverId) {
    throw new ValidationError("You cannot connect with yourself.");
  }

  // Check if already exists
  const existing = await Connection.findOne({
    where: {
      requesterId,
      receiverId,
    },
  });

  if (existing) {
    throw new ConflictError("Connection already exists or pending.");
  }

  // Create connection request
  const connection = await Connection.create({
    requesterId,
    receiverId,
    status: "pending",
  });

  res.status(200).json({
    success: true,
    status: connection.status
  });
});
export const getConnections = catchAsync(async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
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
      const otherUser = isRequester ? conn.receiver : conn.requester;

      return {
        id: conn.id,
        user: otherUser,
        direction: isRequester ? "sent" : "received",
        status: conn.status,
      };
    });

  res.status(200).json({
    success: true,
    connections: formatted
  });
});

export const acceptConnection = catchAsync(async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id!;
  const connectionId = req.params.id;

  const connection = await Connection.findByPk(connectionId);

  if (!connection || connection.receiverId !== userId) {
    throw new ValidationError("Not authorized to accept this request.");
  }

  connection.status = ConnectionStatus.ACCEPTED;
  await connection.save();

  res.status(200).json({
    success: true,
    status: "accepted"
  });
});

export const rejectConnection = catchAsync(async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id!;
  const connectionId = req.params.id;

  const connection = await Connection.findByPk(connectionId);

  if (!connection || connection.receiverId !== userId) {
    throw new ValidationError("Not authorized to reject this request.");
  }

  connection.status = ConnectionStatus.REJECTED;
  await connection.save();

  res.status(200).json({
    success: true,
    status: "rejected"
  });
});

export const preferences = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = await User.findByPk(req.user?.id);
  if (!user) throw new NotFoundError("User not found");

  const { receiveMatchReminders, receiveEmailNotifications } = req.body;

  if (receiveMatchReminders !== undefined)
    user.receiveMatchReminders = receiveMatchReminders;
  if (receiveEmailNotifications !== undefined)
    user.receiveEmailNotifications = receiveEmailNotifications;

  await user.save();
  res.status(200).json({ 
    success: true,
    message: "Preferences updated" 
  });
});
