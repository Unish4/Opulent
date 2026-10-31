import { rateLimit } from "express-rate-limit";
import { ENV } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

const perUser = (req: { appUser?: { _id: unknown } }): string =>
  String(req.appUser?._id ?? "anonymous");

export const lookupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: ENV.LOOKUP.USER_LIMIT_PER_HOUR,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: perUser,
  handler: (_req, _res, next) =>
    next(new ApiError(429, "Too many checks. Please wait a few minutes.")),
});

export const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: perUser,
  handler: (_req, _res, next) =>
    next(new ApiError(429, "Too many orders. Please wait a few minutes.")),
});

export const refundLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: perUser,
  handler: (_req, _res, next) =>
    next(new ApiError(429, "Too many requests. Please wait a while.")),
});
