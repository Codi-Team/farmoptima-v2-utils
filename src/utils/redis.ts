import { createClient, RedisClientType } from "redis";
import { config } from "./../config";
import { BadRequestError, InternalServerError } from "./error";
import { logger } from "./logger";

let redisClient: RedisClientType | null = null;

export async function initRedisClient(): Promise<void> {
  if (redisClient) {
    logger.warn("Redis client is already initialized.");
    return; // Avoid reinitializing if already initialized
  }

  try {
    redisClient = createClient({
      password: config.redis.password,
      socket: { host: config.redis.host, port: config.redis.port },
    });

    await redisClient.connect();
    logger.info("Redis client connected successfully.");
  } catch (error) {
    logger.error("Error initializing Redis client:", error);
    throw new InternalServerError("Could not connect to Redis");
  }
}

export function useRedisClient(): RedisClientType {
  if (!redisClient) {
    logger.warn("Attempted to use Redis client before initialization.");
    throw new BadRequestError(
      "Redis client is not initialized. Please call initRedisClient first."
    );
  }
  return redisClient;
}

// Close the Redis connection
export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info("Redis client disconnected successfully.");
      redisClient = null; // Clear the client reference after disconnecting
    } catch (error) {
      logger.error("Error disconnecting Redis client:", error);
      throw new InternalServerError("Could not disconnect Redis client");
    }
  } else {
    logger.warn("Redis client is already disconnected.");
  }
}

// Check connection status
export async function checkRedisConnection(): Promise<boolean> {
  if (!redisClient) {
    logger.warn("Redis client is not initialized. Connection check failed.");
    return false; // Not initialized
  }
  try {
    await redisClient.ping(); // Ping to check connection
    logger.info("Redis client connection is active.");
    return true;
  } catch (error) {
    logger.error("Error checking Redis connection:", error);
    return false;
  }
}
