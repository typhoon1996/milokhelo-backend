import app from "./app";
import { createServer } from "http";
import { Server } from "socket.io";
import { initSocket } from "./sockets/index";
import { connectDB } from "./config/database";
import { initDb } from "./models";
import { startMatchReminderJob } from "./jobs/matchReminder.job";
import { startTeamInviteReminderJob } from "./jobs/teamInviteReminder.job";
const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN },
});

initSocket(io); // Chat, notifications, etc.

const start = async () => {
  try {
    await connectDB(); // Sequelize init
    await initDb();
    httpServer.listen(PORT, () => {
      console.log(`🚀 MiloKhelo running on http://localhost:${PORT}`);
    });
    startMatchReminderJob();
    startTeamInviteReminderJob();
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

start();
