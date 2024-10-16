import jwt, { SignOptions } from "jsonwebtoken";
import { BadRequestError } from "./error";
import { logger } from "./logger";

export function generateToken({
  metadata = {},
  secret,
  options = {},
}: {
  metadata?: Record<string, unknown>;
  secret: string;
  options?: jwt.SignOptions;
}): string {
  // Check for secret
  if (!secret) {
    logger.error(
      "Failed to generate token: Missing secret for token generation"
    );
    throw new BadRequestError("Missing secret for token generation");
  }

  // Validate metadata
  if (typeof metadata !== "object" || Array.isArray(metadata)) {
    logger.error(
      "Failed to generate token: Invalid metadata - must be a non-array object"
    );
    throw new BadRequestError("Invalid metadata: must be a non-array object");
  }

  // Set default options
  const defaultOptions: SignOptions = {
    expiresIn: "1h",
    ...options,
  };

  // Log the metadata being used for token generation
  logger.info(`Generating token with metadata: ${JSON.stringify(metadata)}`);

  try {
    // Generate the token
    const token = jwt.sign(metadata, secret, defaultOptions);

    logger.info("Token successfully generated");

    return token;
  } catch (error) {
    logger.error(
      `Failed to generate token: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    throw new BadRequestError(
      "Token generation failed due to an internal error."
    );
  }
}
