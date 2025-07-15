"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const index_1 = require("./sockets/index");
const sequelize_1 = require("./config/sequelize");
const models_1 = require("./models");
const PORT = process.env.PORT || 3000;
const httpServer = (0, http_1.createServer)(app_1.default);
const io = new socket_io_1.Server(httpServer, { cors: { origin: process.env.CORS_ORIGIN } });
(0, index_1.initSocket)(io); // Chat, notifications, etc.
const start = async () => {
    try {
        await (0, sequelize_1.connectDB)(); // Sequelize init
        httpServer.listen(PORT, () => {
            console.log(`🚀 MiloKhelo running on http://localhost:${PORT}`);
        });
    }
    catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
};
start();
await (0, models_1.initDb)();
