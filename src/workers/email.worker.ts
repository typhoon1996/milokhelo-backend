import { Worker } from "bullmq";
import { redisConnection } from "./redis";
import { sendEmail } from "../utils/email";

new Worker(
  "emailQueue",
  async (job) => {
    const { to, subject, html } = job.data;
    await sendEmail({ to, subject, html });
  },
  { connection: redisConnection }
);
