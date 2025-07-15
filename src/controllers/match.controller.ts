import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Match } from "../models/Match";
import { MatchParticipant } from "../models/MatchParticipant";
import { Op } from "sequelize";
import { User } from "../models/User";
import { eventBus } from "../events/eventBus";

export const createMatch = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, sport, location, startTime, skillLevel, maxPlayers } =
      req.body;

    if (
      !title ||
      !sport ||
      !location ||
      !startTime ||
      !skillLevel ||
      !maxPlayers
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const match = await Match.create({
      creatorId: req.user?.id,
      title,
      sport,
      location,
      startTime,
      skillLevel,
      maxPlayers,
    });

    res.status(201).json(match);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMatches = async (req: Request, res: Response) => {
  try {
    const { query, sport, skill, page = 1, limit = 10 } = req.query;

    const filters: any = {};

    if (query) {
      filters.title = { [Op.iLike]: `%${query}%` };
    }

    if (sport) {
      filters.sport = sport;
    }

    if (skill) {
      filters.skillLevel = skill;
    }

    const offset = (Number(page) - 1) * Number(limit);

    const { count, rows } = await Match.findAndCountAll({
      where: filters,
      offset,
      limit: Number(limit),
      order: [["startTime", "ASC"]],
    });

    res.status(200).json({
      data: rows,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(count / Number(limit)),
        totalItems: count,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyMatches = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id!;
    const now = new Date();

    // Matches created by user
    const createdMatches = await Match.findAll({
      where: {
        creatorId: userId,
      },
    });

    // Matches RSVP’d to
    const joinedMatchIds = await MatchParticipant.findAll({
      where: { userId },
      attributes: ["matchId"],
    });

    const matchIds = joinedMatchIds.map((r) => r.matchId);

    const joinedMatches = await Match.findAll({
      where: {
        id: {
          [Op.in]: matchIds,
        },
      },
    });

    const allMatches = [...createdMatches, ...joinedMatches];

    // Split upcoming and past
    const upcoming = allMatches.filter(
      (match) => new Date(match.startTime) > now
    );
    const past = allMatches.filter((match) => new Date(match.startTime) <= now);

    res.status(200).json({ upcoming, past });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMatchDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const match = await Match.findByPk(id, {
      include: [
        {
          model: MatchParticipant,
          include: [User],
        },
      ],
    });

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    // Format attendees
    const attendees = match.participants.map((p) => ({
      id: p.user.id,
      name: p.user.name,
      email: p.user.email,
    }));

    res.status(200).json({
      id: match.id,
      title: match.title,
      sport: match.sport,
      location: match.location,
      skillLevel: match.skillLevel,
      startTime: match.startTime,
      maxPlayers: match.maxPlayers,
      attendees,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const rsvpToMatch = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id!;
    const matchId = req.params.id;

    const match = await Match.findByPk(matchId, {
      include: [MatchParticipant],
    });

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const alreadyRSVPed = await MatchParticipant.findOne({
      where: { userId, matchId },
    });

    if (alreadyRSVPed) {
      return res.status(409).json({ message: "Already RSVP’d to this match" });
    }

    const rsvpCount = await MatchParticipant.count({ where: { matchId } });

    if (rsvpCount >= match.maxPlayers) {
      return res.status(409).json({ message: "Match is full" });
    }

    await MatchParticipant.create({ userId, matchId });

    eventBus.emit("RSVP_CREATED", { userId, matchId });

    res.status(200).json({ message: "RSVP successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const cancelRsvpMatch = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id!;
    const matchId = req.params.id;

    const participant = await MatchParticipant.findOne({
      where: { userId, matchId },
    });

    if (!participant) {
      return res
        .status(404)
        .json({ message: "You are not RSVP'd to this match" });
    }

    await participant.destroy();

    res.status(200).json({ message: "RSVP cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
