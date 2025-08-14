import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Notification } from "../models/Notification";

export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user?.id },
      order: [["createdAt", "DESC"]],
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const markNotificationsRead = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { notificationIds = [] } = req.body;
  try {
    if (notificationIds.length === 0) {
      await Notification.update(
        { read: true },
        { where: { userId: req.user?.id } }
      );
    } else {
      await Notification.update(
        { read: true },
        {
          where: { userId: req.user?.id, id: notificationIds },
        }
      );
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
