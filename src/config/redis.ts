import { RedisOptions } from "bullmq";
import IORedis from "ioredis";

// It's generally better practice to pull sensitive or environment-dependent
// configurations from environment variables.
// For example, using process.env.REDIS_HOST, process.env.REDIS_PORT, process.env.REDIS_PASSWORD

export const redisConnection: RedisOptions = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  // Handle password conditionally based on whether it's provided in env
  password: process.env.REDIS_PASSWORD || undefined, // Set to undefined if not provided
};

export const redisClient = new IORedis(redisConnection); // if needed elsewhere

// It's good practice to handle connection errors for the client
redisClient.on("error", (error) => {
  console.error("Redis Client Error:", error);
  // Depending on your application's needs, you might want to
  // perform more robust error handling here, like attempting to reconnect
  // or shutting down gracefully.
});

redisClient.on("connect", () => {
  console.log("Redis Client connected successfully.");
});

redisClient.on("ready", () => {
  console.log("Redis Client is ready.");
});

redisClient.on("end", () => {
  console.log("Redis Client connection ended.");
});
