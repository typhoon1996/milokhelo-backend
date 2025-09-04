import { Response } from "express";
import { AuthenticatedRequest } from "@/middlewares/auth.middleware";
import { Notification } from "@/models/Notification";

export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user?.id },
      order: [["createdAt", "DESC"]],
    });
    res.json(notifications);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

export const markNotificationsRead = async (req: AuthenticatedRequest, res: Response) => {
  const { notificationIds = [] } = req.body as { notificationIds?: string[] };

  try {
    if (notificationIds.length === 0) {
      await Notification.update({ read: true }, { where: { userId: req.user?.id } });
    } else {
      await Notification.update(
        { read: true },
        {
          where: { userId: req.user?.id, id: notificationIds },
        },
      );
    }
    res.status(204).send();
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
