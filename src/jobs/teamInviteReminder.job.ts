import cron from "node-cron";
import { Op } from "sequelize";
import { TeamInvite } from "../models/TeamInvite";
import { User } from "../models/User";
import { sendNotification } from "../sockets";
import { emailQueue } from "../queues/email.queue";
import { subDays } from "date-fns";

export const startTeamInviteReminderJob = () => {
  cron.schedule("0 9 * * *", async () => {
    try {
      console.log("Running team invite reminder job..."); // Add logging
      const yesterday = subDays(new Date(), 1);

      const invites = await TeamInvite.findAll({
        where: {
          status: "pending",
          createdAt: { [Op.lte]: yesterday },
        },
      });

      for (const invite of invites) {
        try {
          // Individual error handling for each invite
          const user = await User.findByPk(invite.invitedUserId);
          if (!user?.receiveMatchReminders) continue;

          await sendNotification(user.id, {
            message: `Reminder: You have a pending team invite.`,
            type: "team",
          });

          if (user.receiveEmailNotifications) {
            await emailQueue.add("sendReminderEmail", {
              to: user.email,
              subject: "Team Invite Reminder",
              html: `<p>You still haven't responded to your team invite. Don't miss out!</p>`,
            });
          }
        } catch (inviteError) {
          console.error(
            `Error processing invite for user ${invite.invitedUserId}:`,
            inviteError
          );
        }
      }
      console.log("Team invite reminder job completed."); // Add logging
    } catch (jobError) {
      console.error("Error in team invite reminder cron job:", jobError);
      // Potentially alert monitoring system here
    }
  });
};
