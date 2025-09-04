import { Response } from "express";
import { Match } from "@/models/Match";
import { Review } from "@/models/Review";
import { AuthenticatedRequest } from "@/middlewares/auth.middleware";
import { User } from "@/models/User";

async function analyzeMatchFeedback(comment: string) {
  // Simple sentiment analysis (can be enhanced with a proper NLP library)
  const lowerComment = comment.toLowerCase();
  const positiveWords = ["good", "great", "excellent", "amazing", "awesome", "fantastic"];
  const negativeWords = ["bad", "poor", "terrible", "awful", "horrible"];

  const sentiment = positiveWords.some((word) => lowerComment.includes(word))
    ? "positive"
    : negativeWords.some((word) => lowerComment.includes(word))
      ? "negative"
      : "neutral";

  // Extract keywords (simple implementation - can be enhanced)
  const commonWords = new Set(["the", "and", "but", "was", "were", "for", "that", "this"]);
  const words = comment
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3 && !commonWords.has(word));

  // Get unique words and limit to top 3
  const keywords = [...new Set(words)].slice(0, 3);

  return {
    sentiment,
    keywords,
    summary: `Feedback analysis shows ${sentiment} sentiment with key topics: ${keywords.join(", ")}`,
  };
}

export const submitMatchReview = async (req: AuthenticatedRequest, res: Response) => {
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
      return res.status(409).json({ message: "You have already reviewed this match." });
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

export const getMatchReviews = async (req: AuthenticatedRequest, res: Response) => {
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
