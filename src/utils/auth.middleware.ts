import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "./error";
import { logger } from "./logger";

export function authMiddleware(access_token_secret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if access token secret is provided
    if (!access_token_secret) {
      logger.error("Access token secret is required.");
      return next(new UnauthorizedError("Access token secret is required."));
    }

    const authorization = req.headers["authorization"];
    // Expect authorization header in format: 'Bearer <token>'
    if (!authorization || !authorization.startsWith("Bearer ")) {
      logger.warn("Unauthorized access attempt. No token provided.");
      return next(new UnauthorizedError("Unauthorized. No token provided."));
    }

    // Extract the token after 'Bearer '
    const token = authorization.split(" ")[1];
    if (!token) {
      logger.warn("Unauthorized access attempt. Invalid token format.");
      return next(new UnauthorizedError("Unauthorized. Invalid token format."));
    }

    // Verify the token
    jwt.verify(
      token,
      access_token_secret,
      (err: jwt.VerifyErrors | null, user: any) => {
        if (err) {
          logger.warn(
            `Invalid or expired authorization token: ${
              err instanceof Error ? err.stack : err
            }`
          );
          return next(
            new UnauthorizedError("Invalid or expired authorization token.")
          );
        }

        // Log successful authentication
        logger.info(`User authenticated successfully: ${JSON.stringify(user)}`);

        // Attach the decoded user to request headers or better attach to req.user
        req.headers["user"] = user;
        next();
      }
    );
  };
}
