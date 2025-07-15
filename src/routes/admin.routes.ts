import express from "express";
import { isAdmin } from "../middlewares/role.middleware";
import { TeamInvite } from "../models/TeamInvite";
import { Notification } from "../models/Notification";
import { emailQueue } from "../queues/email.queue";

const router = express.Router();

router.use(isAdmin);

// Get pending invites
router.get("/invites/pending", async (req, res) => {
  const invites = await TeamInvite.findAll({ where: { status: "pending" } });
  res.json(invites);
});

// Resend team invite email
router.post("/invites/:id/resend", async (req, res) => {
  const invite = await TeamInvite.findByPk(req.params.id);
  if (!invite) return res.status(404).json({ message: "Invite not found" });

  const user = await invite.$get("invitedUser");
  if (!user) return res.status(404).json({ message: "User not found" });

  await emailQueue.add("sendReminderEmail", {
    to: user.email,
    subject: "Team Invite Reminder",
    html: `<p>This is a reminder about your team invite.</p>`,
  });

  res.json({ message: "Reminder sent" });
});
