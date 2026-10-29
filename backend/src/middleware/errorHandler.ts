import type { ErrorRequestHandler, RequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import {
  ApiError,
  type ApiErrorDetail,
  type ErrorCode,
} from "../utils/ApiError.js";

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new ApiError(404, "Route not found"));
};

const isBodyParserError = (err: unknown): err is { type: string } =>
  typeof err === "object" &&
  err !== null &&
  "type" in err &&
  typeof err.type === "string" &&
  err.type.startsWith("entity.");

const isDuplicateKeyError = (err: unknown): boolean =>
  typeof err === "object" &&
  err !== null &&
  "code" in err &&
  err.code === 11000;

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  let status = 500;
  let code: ErrorCode = "INTERNAL_ERROR";
  let message = "Something went wrong. Please try again.";
  let details: ApiErrorDetail[] | undefined;

  if (err instanceof ApiError) {
    ({ statusCode: status, code, message, details } = err);
  } else if (err instanceof ZodError) {
    status = 400;
    code = "VALIDATION_ERROR";
    message = "Some fields are invalid.";
    details = err.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    code = "VALIDATION_ERROR";
    message = "Some fields are invalid.";
    details = Object.values(err.errors).map((e) => ({
      path: e.path,
      message: e.message,
    }));
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    code = "VALIDATION_ERROR";
    message = "Invalid identifier.";
  } else if (isDuplicateKeyError(err)) {
    status = 409;
    code = "DUPLICATE_RESOURCE";
    message = "That value is already in use.";
  } else if (isBodyParserError(err)) {
    status = 400;
    code = "VALIDATION_ERROR";
    message =
      err.type === "entity.too.large"
        ? "Request body is too large."
        : "Request body is not valid JSON.";
  }

  if (status >= 500) req.log.error({ err }, "Unhandled error");

  res.status(status).json({
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      requestId: String(req.id),
    },
  });
};
