import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import compression from "compression";
import cookieParser from "cookie-parser";

import { errorHandler, notFound } from "./middlewares/error.middleware";
import bullBoardAdapter from "./queues/queue-dashboard";

// Load environment variables
dotenv.config();

const app = express();

// ---------- Middlewares ----------
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(compression());

// ---------- Health check ----------
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK", service: "MiloKhelo API" });
});

// ---------- Routes ----------
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import matchRoutes from "./routes/match.routes";
import teamRoutes from "./routes/team.routes";
import reviewRoutes from "./routes/review.routes";
import chatRoutes from "./routes/chat.routes";
import notificationRoutes from "./routes/notification.routes";

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);

// ---------- Admin Queue Dashboard ----------
app.use("/admin/queues", bullBoardAdapter.getRouter());

// ---------- Fallbacks ----------
app.use(notFound);
app.use(errorHandler);

export default app;
