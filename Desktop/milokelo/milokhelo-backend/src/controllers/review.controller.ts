import { Request, Response } from "express";
import { Match } from "../models/Match";
import { Review } from "../models/Review";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { User } from "../models/User";

async function analyzeMatchFeedback(comment: string) {
  return {
    sentiment: "positive",
    keywords: ["teamwork", "fair play"],
    summary: "Player provided positive feedback with emphasis on cooperation.",
  };
}

export const submitMatchReview = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id!;
    const matchId = req.params.matchId;
    const { rating, comment } = req.body;

    const match = await Match.findByPk(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // Optionally: verify match is completed and user was a participant

    const existing = await Review.findOne({ where: { matchId, userId } });
    if (existing) {
      return res
        .status(409)
        .json({ message: "You have already reviewed this match." });
    }

    const analysis = await analyzeMatchFeedback(comment);

    const review = await Review.create({
      userId,
      matchId,
      rating,
      comment,
      analysis,
    });

    res.status(201).json({ review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMatchReviews = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const matchId = req.params.matchId;

    const reviews = await Review.findAll({
      where: { matchId },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
