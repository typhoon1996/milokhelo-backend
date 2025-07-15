import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { Message } from "../models/Message";
import { Notification } from "../models/Notification";
import { Op } from "sequelize";
import { Participant } from "../models/Participant";
import { eventBus } from "../events/eventBus";

let ioInstance: Server;

export const initSocket = (io: Server) => {
  ioInstance = io;

  io.use((socket, next) => {
    const token = socket.handshake.auth?.accessToken;
    if (!token) return next(new Error("Authentication error"));

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET!);
      (socket as any).user = user;
      next();
    } catch (err) {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`✅ Socket connected: ${user.id}`);

    // Join a room named after the user's ID for notifications
    socket.join(user.id);

    // Chat room join
    socket.on("joinRoom", ({ conversationId }) => {
      socket.join(conversationId);
    });

    // Sending messages
    socket.on("sendMessage", async ({ conversationId, text }) => {
      try {
        const newMessage = await Message.create({
          conversationId,
          senderId: user.id,
          text,
        });

        // Update unreadCount for all participants except sender
        await Participant.increment("unreadCount", {
          where: {
            conversationId,
            userId: { [Op.ne]: user.id },
          },
        });

        io.to(conversationId).emit("newMessage", newMessage);
      } catch (err) {
        socket.emit("chatError", { message: "Failed to send message" });
      }
    });
    // Typing start
    socket.on("typing", ({ conversationId }) => {
      socket.to(conversationId).emit("typing", {
        userId: (socket as any).user.id,
        conversationId,
      });
    });

    // Typing stop
    socket.on("stopTyping", ({ conversationId }) => {
      socket.to(conversationId).emit("stopTyping", {
        userId: (socket as any).user.id,
        conversationId,
      });
    });

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${user.id}`);
    });
  });
};

// ✅ Exportable utility to send real-time notifications
export const sendNotification = async (
  userId: string,
  payload: { message: string; type: string }
) => {
  const notification = await Notification.create({
    userId,
    message: payload.message,
    type: payload.type,
  });

  if (ioInstance) {
    ioInstance.to(userId).emit("newNotification", notification);
  }
};

eventBus.on("RSVP_CREATED", async ({ userId, matchId }) => {
  await sendNotification(userId, {
    message: "You’ve got a new RSVP!",
    type: "match",
  });
});
