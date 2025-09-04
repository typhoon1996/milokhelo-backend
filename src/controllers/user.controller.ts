import { Response } from "express";
import { validationResult } from "express-validator";
import { AuthenticatedRequest } from "@/middlewares/auth.middleware";
import { User } from "@/models/User";
import { Connection } from "@/models/Connection";
import { Op, WhereOptions } from "sequelize";
import { catchAsync } from "@/utils/catchAsync";
import { ValidationError, ConflictError, UnauthorizedError } from "@/utils/AppError";

/**
 * User Controller
 */
export const getSuggestedUsers = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError("Validation failed");
  }

  const currentUserId = req.user?.id;
  if (!currentUserId) {
    throw new UnauthorizedError("User not authenticated");
  }

  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit as string, 10) || 10, 50);
  const offset = (page - 1) * limit;
  const search = req.query.search as string | undefined;

  const existingConnections = await Connection.findAll({
    where: {
      [Op.or]: [{ requesterId: currentUserId }, { receiverId: currentUserId }],
    },
    attributes: ["requesterId", "receiverId"],
  });

  const existingConnectionIds = existingConnections
    .flatMap((conn) => [conn.requesterId, conn.receiverId])
    .filter((id) => id !== currentUserId);

  const whereClause: WhereOptions<User> = {
    id: { [Op.notIn]: [currentUserId, ...existingConnectionIds] },
    ...(search && {
      [Op.or]: [{ name: { [Op.iLike]: `%${search}%` } }, { email: { [Op.iLike]: `%${search}%` } }],
    }),
  };

  const { count, rows: users } = await User.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    attributes: ["id", "name", "email", "createdAt"],
    order: [["createdAt", "DESC"]],
  });

  res.status(200).json({
    success: true,
    users,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  });
});

export const sendConnectionRequest = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new ValidationError("Validation failed");

    const requesterId = req.user?.id;
    if (!requesterId) throw new UnauthorizedError("User not authenticated");

    const receiverId = req.params.userId;
    if (requesterId === receiverId) {
      throw new ValidationError("You cannot connect with yourself.");
    }

    const existing = await Connection.findOne({
      where: {
        [Op.or]: [
          { requesterId, receiverId },
          { requesterId: receiverId, receiverId: requesterId },
        ],
      },
    });

    if (existing) {
      throw new ConflictError("Connection already exists or pending.");
    }

    const connection = await Connection.create({
      requesterId,
      receiverId,
      status: "pending",
    });

    res.status(200).json({ success: true, status: connection.status });
  },
);

export const getConnections = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new UnauthorizedError("User not authenticated");

  const connections = await Connection.findAll({
    where: { [Op.or]: [{ requesterId: userId }, { receiverId: userId }] },
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

  res.status(200).json({ success: true, connections: formatted });
});
