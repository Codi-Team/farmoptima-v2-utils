import bcrypt from "bcrypt";
import { BadRequestError, InternalServerError } from "./error";
import { logger } from "./logger";

export async function hashPassword(
  password: string,
  saltRounds: number = 10
): Promise<string> {
  // Validate password
  if (typeof password !== "string" || password.trim() === "") {
    logger.error("Invalid password: must be a non-empty string");
    throw new BadRequestError("Invalid password: must be a non-empty string");
  }

  // Validate saltRounds
  if (typeof saltRounds !== "number" || saltRounds < 1 || saltRounds > 15) {
    logger.error("Invalid saltRounds: must be a positive integer (1-15)");
    throw new BadRequestError(
      "Invalid saltRounds: must be a positive integer (1-15)"
    );
  }

  logger.info("Hashing password...");

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    logger.info("Password hashed successfully");
    return hashedPassword;
  } catch (error) {
    logger.error("Error hashing password:", error);
    throw new InternalServerError("Password hashing failed");
  }
}
