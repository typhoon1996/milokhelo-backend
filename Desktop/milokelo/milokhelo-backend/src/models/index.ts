import { sequelize } from '../config/database';

export const initDb = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true }); // Use alter/dev; switch to migrations in prod
    console.log('🟢 Database connected & synced.');
  } catch (err) {
    console.error('🔴 Database connection error:', err);
    process.exit(1);
  }
};
