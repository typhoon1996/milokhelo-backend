import { Router } from "express";
import {
  submitMatchReview,
  getMatchReviews,
} from "../controllers/review.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

// Submit review + AI feedback for a completed match
router.post("/match/:matchId", authenticateJWT, submitMatchReview);

router.get("/match/:matchId", authenticateJWT, getMatchReviews);
export default router;
