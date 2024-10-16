import { BadRequestError } from "./error";
import { logger } from "./logger";

export function paginate<T>(
  items: T[],
  page: number = 1,
  limit: number = 10,
  length: number = items.length
): { items: T[]; pages: number; pageRange: string } {
  // Validate parameters
  if (!Array.isArray(items)) {
    logger.error("Items must be an array.");
    throw new BadRequestError("Items must be an array.");
  }

  if (typeof page !== "number" || page < 1) {
    logger.error("Invalid page number. Must be a positive integer.");
    throw new BadRequestError("Page number must be a positive integer.");
  }

  if (typeof limit !== "number" || limit < 1) {
    logger.error("Invalid limit. Must be a positive integer.");
    throw new BadRequestError("Limit must be a positive integer.");
  }

  if (length < 0) {
    logger.error("Length cannot be negative.");
    throw new BadRequestError("Length cannot be negative.");
  }

  if (length === 0) {
    logger.info("No items to paginate. Returning empty items.");
    return { items: [], pages: 0, pageRange: "0-0 of 0" };
  }

  // Normalize page number and calculate total pages
  const pages = Math.ceil(length / limit);
  page = Math.min(page, pages); // Ensure the page doesn't exceed the total pages

  // Calculate start and end indices
  const startIndex = (page - 1) * limit;
  const endIndex = Math.min(startIndex + limit, length);

  logger.info(
    `Paginating items: Page ${page}, Limit ${limit}, Total Items ${length}.`
  );

  return {
    items: items.slice(startIndex, endIndex),
    pages,
    pageRange: `${startIndex + 1}-${endIndex} of ${length}`,
  };
}
