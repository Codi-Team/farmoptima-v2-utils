import { createLogger, format, transports } from "winston";
import { InternalServerError } from "./error";

// Determine the logging level based on the environment
const logLevel = process.env.NODE_ENV === "production" ? "error" : "debug";

// Custom log format
const customFormat = format.combine(
  format.timestamp(),
  format.printf(({ timestamp, level, message, meta }) => {
    const metaString =
      meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${timestamp} [${level}]: ${message}${metaString}`;
  })
);

// Create the logger
export const logger = createLogger({
  level: logLevel,
  format: customFormat,
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), customFormat),
    }),
    new transports.File({
      filename: "error.log",
      level: "error",
      format: format.json(),
    }),
    new transports.File({
      filename: "combined.log",
      format: format.json(),
    }),
  ],
});

// Error handling for logger
logger.on("error", (error) => {
  console.error("Logger encountered an error:", error);
});

// Error handling utility function
export const handleError = (error: Error) => {
  if (error instanceof InternalServerError) {
    logger.error("Internal Server Error: ", {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    });
  } else {
    logger.error("Unexpected error: ", {
      message: error.message,
      stack: error.stack,
    });
  }
};

// Export log levels for usage throughout your application
export const LogLevels = {
  info: "info",
  warn: "warn",
  error: "error",
  debug: "debug",
};

// Utility functions for logging with optional metadata
export const logInfo = (message: string, meta?: Record<string, any>) =>
  logger.info(message, { meta });

export const logError = (message: string, meta?: Record<string, any>) =>
  logger.error(message, { meta });

export const logWarning = (message: string, meta?: Record<string, any>) =>
  logger.warn(message, { meta });

export const logDebug = (message: string, meta?: Record<string, any>) =>
  logger.debug(message, { meta });
