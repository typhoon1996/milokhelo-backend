import { Router } from "express";
import {
  createMatch,
  getMatches,
  getMyMatches,
  getMatchDetails,
  rsvpToMatch,
  cancelRsvpMatch,
} from "../controllers/match.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

// Create a new match
router.post("/", authenticateJWT, createMatch);

// List public matches (with query filters)
router.get("/", getMatches);

// Get matches created by or RSVP'd by user
router.get("/my", authenticateJWT, getMyMatches);

// Get details of a specific match
router.get("/:id", getMatchDetails);

// RSVP to a match
router.post("/:id/rsvp", authenticateJWT, rsvpToMatch);

// Cancel RSVP
router.delete("/:id/rsvp", authenticateJWT, cancelRsvpMatch);

export default router;
