import { NextFunction, Request, Response } from "express";
import { AppError } from "./error";
import { logger } from "./logger";

// Type guard to check if an error is an instance of AppError
const isAppError = (error: any): error is AppError => {
  return (
    error &&
    typeof error.statusCode === "number" &&
    typeof error.isOperational === "boolean"
  );
};

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log detailed error information with request context
  const requestInfo = `Method: ${req.method}, URL: ${req.originalUrl}`;
  const errorMessage = err.stack || err.toString();

  if (process.env.NODE_ENV === "development") {
    logger.error(
      `Error occurred: ${errorMessage}\nRequest Info: ${requestInfo}`
    );
  } else {
    logger.error(
      `An unexpected error occurred: ${err.message}\nRequest Info: ${requestInfo}`
    );
  }

  // Determine the status code and operational status of the error
  const statusCode = isAppError(err) ? err.statusCode : 500;
  const isOperational = isAppError(err) ? err.isOperational : false;

  // Prepare the error response
  const response = {
    status: isOperational ? "error" : "fail",
    message: isOperational ? err.message : "Internal Server Error",
    ...(isAppError(err) && { code: err.code }), // Include error code if it's an AppError
  };

  // Send the error response
  res.status(statusCode).json(response);
};
