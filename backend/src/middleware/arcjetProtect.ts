import type { RequestHandler } from "express";
import { aj } from "../config/arcjet.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

export const arcjetProtect: RequestHandler = async (req, _res, next) => {
  if (!aj) {
    next();
    return;
  }

  try {
    const decision = await aj.protect(req, { requested: 1 });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        next(new ApiError(429, "Too many requests. Please slow down."));
        return;
      }
      if (decision.reason.isBot()) {
        next(new ApiError(403, "Automated requests are not allowed."));
        return;
      }
      next(new ApiError(403, "This request was blocked."));
      return;
    }

    next();
  } catch (err) {
    logger.warn(
      { errName: err instanceof Error ? err.name : "unknown" },
      "Arcjet check failed, allowing request",
    );
    next();
  }
};
