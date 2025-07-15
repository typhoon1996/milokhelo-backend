import { Sequelize } from "sequelize-typescript";
import { User } from "../models/User";
import dotenv from "dotenv";
import { Connection } from "../models/Connection";
import { Match } from "../models/Match";
import { MatchParticipant } from "../models/MatchParticipant";
import { Team } from "../models/Team";
import { TeamMember } from "../models/TeamMember";
import { Review } from "../models/Review";
import { Participant } from "../models/Participant";
import { Message } from "../models/Message";
import { Conversation } from "../models/Conversation";

dotenv.config();

export const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialect: "postgres",
  models: [
    User,
    Connection,
    Match,
    MatchParticipant,
    Team,
    TeamMember,
    Review,
    Participant,
    Message,
    Conversation,
  ],
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
    process.exit(1);
  }
};
