"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDb = void 0;
const database_1 = require("../config/database");
const initDb = async () => {
    try {
        await database_1.sequelize.authenticate();
        await database_1.sequelize.sync({ alter: true }); // Use alter/dev; switch to migrations in prod
        console.log('🟢 Database connected & synced.');
    }
    catch (err) {
        console.error('🔴 Database connection error:', err);
        process.exit(1);
    }
};
exports.initDb = initDb;
