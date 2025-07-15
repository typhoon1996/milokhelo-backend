import { Router } from "express";
import {
  createTeam,
  listTeams,
  getTeamDetails,
  joinTeam,
  resend,
} from "../controllers/team.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";
import { isAdmin } from "../middlewares/role.middleware";

const router = Router();

// Create a new team
router.post("/", authenticateJWT, createTeam);

// List teams (public + user's teams)
router.get("/", listTeams);

// Get detailed info of a single team
router.get("/:id", getTeamDetails);

// Request to join a team
router.post("/:id/join", authenticateJWT, joinTeam);

// Resend invite (admin only)
router.post("/invites/:id/resend", authenticateJWT, isAdmin, resend);

export default router;
