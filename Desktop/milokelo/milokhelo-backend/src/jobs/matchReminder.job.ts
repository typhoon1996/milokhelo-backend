import cron from "node-cron";
import { Op } from "sequelize";
import { Match } from "../models/Match";
import { RSVP } from "../models/RSVP"; // Assuming 'RSVP' is your MatchParticipant model
import { User } from "../models/User"; // Import User model to fetch user details
import { sendNotification } from "../sockets";
import { emailQueue } from "../queues/email.queue"; // Assuming you have this queue
import { addHours, startOfHour } from "date-fns"; // Use date-fns for cleaner date manipulation

export const startMatchReminderJob = () => {
  // This cron schedule "* * * * *" means "every minute".
  // For a match reminder job, consider if this is too frequent.
  // "0 * * * *" (every hour at the start of the hour) might be more appropriate.
  cron.schedule("* * * * *", async () => {
    console.log(`[${new Date().toISOString()}] Running match reminder job.`);

    const now = new Date();
    // Calculate the time range for matches starting between 59 and 60 minutes from now
    // This is more robust than fixed minute additions, especially when running every minute.
    const oneHourFromNowStart = addHours(startOfHour(now), 1); // Start of next full hour
    const oneHourFromNowEnd = new Date(
      oneHourFromNowStart.getTime() + 59 * 1000
    ); // Up to 59 seconds into the next hour

    const upcomingMatches = await Match.findAll({
      where: {
        startTime: {
          // Find matches that are scheduled to start exactly one hour from 'now' (within the next minute)
          [Op.between]: [oneHourFromNowStart, oneHourFromNowEnd],
        },
      },
    });

    for (const match of upcomingMatches) {
      console.log(
        `Found upcoming match: "${match.title}" starting at ${match.startTime}`
      );

      // Fetch RSVPs for the current match, and eager-load the associated User
      // This way, you don't need to do findByPk for each RSVP inside the loop.
      const rsvps = await RSVP.findAll({
        where: { matchId: match.id },
        include: [{ model: User }], // Assuming RSVP has a 'userId' and is associated with 'User'
      });

      for (const rsvp of rsvps) {
        // 'rsvp.User' will contain the associated User model if the include was successful
        const user = rsvp.user; // Access the eager-loaded user object

        // Check if user exists and wants reminders
        if (!user || !user.receiveMatchReminders) {
          console.log(
            `Skipping reminder for user ${user?.id} (reminders disabled or user not found).`
          );
          continue;
        }

        // Send push notification (socket)
        await sendNotification(user.id, {
          message: `Reminder: Your match "${match.title}" starts in 1 hour.`,
          type: "reminder",
        });
        console.log(
          `Sent push notification to user ${user.id} for match ${match.id}`
        );

        // Enqueue email job if user wants email notifications
        if (user.receiveEmailNotifications) {
          await emailQueue.add("sendReminderEmail", {
            to: user.email,
            subject: "Match Reminder",
            html: `<p>Your match <strong>${match.title}</strong> starts in 1 hour.</p>`,
          });
          console.log(
            `Enqueued email for user ${user.email} for match ${match.id}`
          );
        }
      }
    }
    console.log(`[${new Date().toISOString()}] Match reminder job finished.`);
  });
};
