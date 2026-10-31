import { rateLimit } from "express-rate-limit";
import { ENV } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export const lookupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: ENV.LOOKUP.USER_LIMIT_PER_HOUR,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => String(req.appUser?._id ?? "anonymous"),
  handler: (_req, _res, next) =>
    next(new ApiError(429, "Too many checks. Please wait a few minutes.")),
});
