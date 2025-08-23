import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { User } from "../models/User";
import { Connection, ConnectionStatus } from "../models/Connection";
import { Op } from "sequelize";
import { catchAsync } from "../utils/catchAsync";
import { ValidationError, ConflictError, NotFoundError, UnauthorizedError } from "../utils/AppError";
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed');
  }

  const currentUserId = req.user?.id;
  
  if (!currentUserId) {
    throw new UnauthorizedError("User not authenticated");
  }

  // Pagination parameters
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50); // Max 50
  const offset = (page - 1) * limit;

  // Search filter
  const search = req.query.search as string;

  // Get existing connection user IDs
  const existingConnections = await Connection.findAll({
    where: {
      [Op.or]: [
        { requesterId: currentUserId },
        { receiverId: currentUserId }
      ]
    },
    attributes: ['requesterId', 'receiverId']
  });

  const existingConnectionIds = existingConnections.flatMap(conn => 
    [conn.requesterId, conn.receiverId]
  ).filter(id => id !== currentUserId);

  // Build where clause
  const whereClause: any = {
    id: {
      [Op.notIn]: [currentUserId, ...existingConnectionIds],
    },
  };

  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } }
    ];
  }

  // Fetch users with pagination
  const { count, rows: users } = await User.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    attributes: ['id', 'name', 'email', 'createdAt'],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    users,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  });
});

export const sendConnectionRequest = catchAsync(async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed');
  }

  const requesterId = req.user?.id;
  if (!requesterId) {
    throw new UnauthorizedError("User not authenticated");
  }
  const receiverId = req.params.userId;

  if (requesterId === receiverId) {
    throw new ValidationError("You cannot connect with yourself.");
  }

  // Check if connection already exists (bidirectional)
  const existing = await Connection.findOne({
    where: {
      [Op.or]: [
        { requesterId, receiverId },
        { requesterId: receiverId, receiverId: requesterId }
      ]
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
  const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedError("User not authenticated");
  }

  const connections = await Connection.findAll({
    where: {
      [Op.or]: [{ requesterId: userId }, { receiverId: userId }],
    },
    include: [
      { model: User, as: "requester", attributes: ["id", "name", "email"] },
      { model: User, as: "receiver", attributes: ["id", "name", "email"] },
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed');
  }

  const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedError("User not authenticated");
  }
  const connectionId = req.params.id;

  const connection = await Connection.findByPk(connectionId);

  if (!connection || connection.receiverId !== userId) {
    throw new ValidationError("Not authorized to accept this request.");
  }

  if (connection.status !== "pending") {
    throw new ValidationError(`Cannot accept connection with status: ${connection.status}`);
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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed');
  }

  const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedError("User not authenticated");
  }
  const connectionId = req.params.id;

  const connection = await Connection.findByPk(connectionId);

  if (!connection || connection.receiverId !== userId) {
    throw new ValidationError("Not authorized to reject this request.");
  }

  if (connection.status !== "pending") {
    throw new ValidationError(`Cannot reject connection with status: ${connection.status}`);
  }

  connection.status = ConnectionStatus.REJECTED;
  await connection.save();

  res.status(200).json({
    success: true,
    status: "rejected"
  });
});

export const getUserProfile = catchAsync(async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedError("User not authenticated");
  }
  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError("User not found");

  res.status(200).json({
    success: true,
    user
  });
});

export const updateUserProfile = catchAsync(async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed');
  }

  const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedError("User not authenticated");
  }
  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError("User not found");

  const { name, email } = req.body;

  // Check if email is being changed and if it's already taken
  if (email && email !== user.email) {
    if (typeof email !== 'string' || !email.includes('@')) {
      throw new ValidationError("Invalid email format");
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictError("Email already in use");
    }
    user.email = email;
  }

  if (name !== undefined) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new ValidationError("Name cannot be empty");
    }
    user.name = name.trim();
  }

  await user.save();
  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user
  });
});

export const preferences = catchAsync(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed');
  }

  const userId = req.user?.id;
  if (!userId) {
    throw new UnauthorizedError("User not authenticated");
  }
  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError("User not found");

  const { receiveMatchReminders, receiveEmailNotifications } = req.body;

  // Type-safe boolean validation
  if (receiveMatchReminders !== undefined) {
    if (typeof receiveMatchReminders !== 'boolean') {
      throw new ValidationError("receiveMatchReminders must be a boolean");
    }
    user.receiveMatchReminders = receiveMatchReminders;
  }
  
  if (receiveEmailNotifications !== undefined) {
    if (typeof receiveEmailNotifications !== 'boolean') {
      throw new ValidationError("receiveEmailNotifications must be a boolean");
    }
    user.receiveEmailNotifications = receiveEmailNotifications;
  }

  await user.save();
  res.status(200).json({ 
    success: true,
    message: "Preferences updated",
    user: {
      receiveMatchReminders: user.receiveMatchReminders,
      receiveEmailNotifications: user.receiveEmailNotifications
    }
  });
});
