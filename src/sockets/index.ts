import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { Message } from "@/models/Message";
import { Notification } from "@/models/Notification";
import { Op } from "sequelize";
import { Participant } from "@/models/Participant";
import { eventBus } from "@/events/eventBus";

// Extend Socket to include user
interface AuthenticatedSocket extends Socket {
  user?: { id: string; [key: string]: unknown };
}

let ioInstance: Server;

export const initSocket = (io: Server) => {
  ioInstance = io;

  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.accessToken;
    if (!token) return next(new Error("Authentication error"));

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      socket.user = user;
      next();
    } catch {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    const user = socket.user!;
    console.log(`✅ Socket connected: ${user.id}`);

    // Join a room named after the user's ID for notifications
    socket.join(user.id);

    // Chat room join
    socket.on("joinRoom", ({ conversationId }: { conversationId: string }) => {
      socket.join(conversationId);
    });

    // Sending messages
    socket.on(
      "sendMessage",
      async ({ conversationId, text }: { conversationId: string; text: string }) => {
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
        } catch {
          socket.emit("chatError", { message: "Failed to send message" });
        }
      },
    );

    // Typing start
    socket.on("typing", ({ conversationId }: { conversationId: string }) => {
      socket.to(conversationId).emit("typing", {
        userId: user.id,
        conversationId,
      });
    });

    // Typing stop
    socket.on("stopTyping", ({ conversationId }: { conversationId: string }) => {
      socket.to(conversationId).emit("stopTyping", {
        userId: user.id,
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
  payload: { message: string; type: string },
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

// RSVP event listener
eventBus.on("RSVP_CREATED", async (payload) => {
  const { userId } = payload as { userId: string };
  await sendNotification(userId, {
    message: "You've got a new RSVP!",
    type: "match",
  });
});
