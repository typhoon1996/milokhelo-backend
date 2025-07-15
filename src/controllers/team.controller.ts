import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { Team, TeamInvite } from "../models/Team";
import { TeamMember } from "../models/TeamMember";
import { Op } from "sequelize";
import { User } from "../models/User";
import { sendNotification } from "../sockets";
import { emailQueue } from "../queues/email.queue";

export const createTeam = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id!;
    const { name, sport } = req.body;

    if (!name || !sport) {
      return res.status(400).json({ message: "Name and sport are required" });
    }

    const team = await Team.create({
      name,
      sport,
      creatorId: userId,
    });

    res.status(201).json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const listTeams = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id!;
    const { filter = "all", query, sport } = req.query;

    const where: any = {};
    if (sport) where.sport = sport;
    if (query) where.name = { [Op.iLike]: `%${query}%` };

    if (filter === "my-teams") {
      // Teams where user is creator or a member
      const memberTeams = await TeamMember.findAll({
        where: {
          userId,
          status: "joined",
        },
        attributes: ["teamId"],
      });

      const teamIds = memberTeams.map((m) => m.teamId);

      const myTeams = await Team.findAll({
        where: {
          [Op.or]: [{ creatorId: userId }, { id: { [Op.in]: teamIds } }],
          ...where,
        },
      });

      return res.status(200).json(myTeams);
    }

    // All public teams
    const allTeams = await Team.findAll({ where });
    return res.status(200).json(allTeams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getTeamDetails = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const team = await Team.findByPk(id, {
      include: [
        {
          model: TeamMember,
          include: [User],
        },
        {
          model: User, // The creator
          as: "creator",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const members =
      team.teamMembers?.map((member: any) => ({
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        status: member.status,
      })) ?? [];

    return res.status(200).json({
      id: team.id,
      name: team.name,
      sport: team.sport,
      creator: team.creator,
      members,
      createdAt: team.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const joinTeam = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id!;
    const teamId = req.params.id;

    const team = await Team.findByPk(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const existing = await TeamMember.findOne({
      where: { userId, teamId },
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: "You have already requested to join this team." });
    }

    // Optionally: check if public and auto-join
    const status = "pending"; // Change to 'joined' if supporting public teams

    await TeamMember.create({
      userId,
      teamId,
      status,
    });

    res.status(200).json({ status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resend = async (req: AuthenticatedRequest, res: Response) => {
  const invite = await TeamInvite.findByPk(req.params.id);
  if (!invite) return res.status(404).json({ message: "Invite not found" });

  const user = await User.findByPk(invite.invitedUserId);
  if (!user) return res.status(404).json({ message: "User not found" });

  await sendNotification(user.id, {
    message: `You've received a team invite.`,
    type: "team",
  });

  if (user.receiveEmailNotifications) {
    await emailQueue.add("sendReminderEmail", {
      to: user.email,
      subject: "Team Invite Reminder",
      html: `<p>This is a friendly reminder about your team invite.</p>`,
    });
  }

  res.status(200).json({ message: "Reminder sent" });
};
