import fs from "fs";
import path from "path";
import { BadRequestError } from "./error";
import { logger } from "./logger";

export function getDirectory(
  directory: string,
  filepath: string,
  extension: string = "hbs"
): string {
  // Validate input parameters
  if (typeof directory !== "string" || directory.trim() === "") {
    logger.error("Invalid directory: must be a non-empty string");
    throw new BadRequestError("Invalid directory: must be a non-empty string");
  }

  if (typeof filepath !== "string" || filepath.trim() === "") {
    logger.error("Invalid filepath: must be a non-empty string");
    throw new BadRequestError("Invalid filepath: must be a non-empty string");
  }

  // Check if the directory exists
  if (!fs.existsSync(directory)) {
    logger.error(`Directory does not exist: ${directory}`);
    throw new BadRequestError(`Directory does not exist: ${directory}`);
  }

  // Resolve the path to the .hbs file
  const resolvedPath = path.resolve(directory, `${filepath}.${extension}`);

  // Log the resolved path
  logger.info(`Resolved path for ${filepath}: ${resolvedPath}`);

  // Check if the file exists
  if (!fs.existsSync(resolvedPath)) {
    logger.error(`File does not exist: ${resolvedPath}`);
    throw new BadRequestError(`File does not exist: ${resolvedPath}`);
  }

  return resolvedPath;
}
