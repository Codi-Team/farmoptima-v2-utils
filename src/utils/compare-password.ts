import bcrypt from "bcrypt";
import { InternalServerError } from "./error";
import { logger } from "./logger";

export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    const result = await bcrypt.compare(password, hashedPassword);
    logger.info("Password comparison successful.", { result });
    return result;
  } catch (error) {
    logger.error(
      `Password comparison failed: ${
        error instanceof Error ? error.stack : error
      }`
    );
    throw new InternalServerError(
      `Password comparison failed: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
