import fs from "fs/promises";
import Handlebars from "handlebars";
import { BadRequestError, InternalServerError } from "./error";
import { logger } from "./logger";

interface CompileOptions {
  context?: Record<string, any>;
  filepath: string;
}

export async function compileHandlebar({
  context = {},
  filepath,
}: CompileOptions): Promise<string> {
  try {
    // Validate the file path
    if (!filepath) {
      throw new BadRequestError("File path must be provided.");
    }

    // Check if the file exists
    await fs.access(filepath);

    // Read the template source file
    const templateSources = await fs.readFile(filepath, { encoding: "utf8" });
    const template = Handlebars.compile(templateSources);
    const compiledTemplate = template(context);

    // Log successful compilation
    logger.info(`Successfully compiled Handlebars template at ${filepath}.`);
    return compiledTemplate;
  } catch (error) {
    logger.error(
      `Failed to compile Handlebars template at ${filepath}: ${
        error instanceof Error ? error.stack : error
      }`
    );

    // Throwing specific error types
    if (error instanceof BadRequestError) {
      throw error;
    } else {
      throw new InternalServerError(
        `Failed to compile Handlebars template at ${filepath}.`
      );
    }
  }
}
