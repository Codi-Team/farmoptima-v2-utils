import * as dotenv from "dotenv";
import { logger } from "./utils/logger";

dotenv.config();

interface Config {
  mongo: {
    uri: string;
    db: string;
    dbDev: string;
  };
  port: number;
  secretKey: string;
  isDev: boolean;
  mailer: {
    transportHost: string;
    transportPort: number;
    transportSecure: boolean;
    email: string;
    password: string;
  };
  tokens: {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    accessTokenExpiry: string;
  };
  redis: {
    host: string;
    port: number;
    password: string;
  };
}

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    logger.error(`Missing required environment variable: ${key}`);
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

// Log the loading of configuration
logger.info("Loading configuration...");

export const config: Config = {
  mongo: {
    uri: getRequiredEnv("MONGO_URI") || "mongodb://localhost:27017",
    db: getRequiredEnv("MONGO_DB") || "default",
    dbDev: getRequiredEnv("MONGO_DB_DEV") || `${process.env.MONGO_DB}-dev`,
  },
  port: Number(process.env.PORT) || 3001,
  secretKey: getRequiredEnv("SECRET_KEY"),
  isDev: process.env.NODE_ENV !== "production",
  mailer: {
    transportHost: getRequiredEnv("MAILER_TRANSPORT_HOST"),
    transportPort: Number(getRequiredEnv("MAILER_TRANSPORT_PORT")),
    transportSecure: process.env.MAILER_TRANSPORT_SECURE === "true",
    email: getRequiredEnv("MAILER_EMAIL"),
    password: getRequiredEnv("MAILER_PASSWORD"),
  },
  tokens: {
    accessTokenSecret: getRequiredEnv("ACCESS_TOKEN_SECRET"),
    refreshTokenSecret: getRequiredEnv("REFRESH_TOKEN_SECRET"),
    accessTokenExpiry: getRequiredEnv("ACCESS_TOKEN_EXPIRY"),
  },
  redis: {
    host: getRequiredEnv("REDIS_HOST"),
    port: Number(process.env.REDIS_PORT) || 6379,
    password: getRequiredEnv("REDIS_PASSWORD"),
  },
};

// Log successful configuration loading
logger.info("Configuration loaded successfully.");
