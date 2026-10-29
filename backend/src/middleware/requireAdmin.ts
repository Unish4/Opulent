import type { Request, RequestHandler } from "express";
import { getAuth } from "@clerk/express";
import { ENV } from "../config/env.js";
import type { UserRole } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

const hasSecondFactor = (req: Request): boolean => {
  if (!ENV.REQUIRE_ADMIN_MFA) return true;
  const fva = getAuth(req).sessionClaims?.fva;
  return Array.isArray(fva) && typeof fva[1] === "number" && fva[1] >= 0;
};

export const requireRole =
  (...roles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    const user = req.appUser;
    if (!user || !roles.includes(user.role)) {
      return next(new ApiError(403, "You do not have access to this resource"));
    }
    if (!hasSecondFactor(req)) {
      return next(
        new ApiError(
          403,
          "Two-step verification is required for admin accounts",
        ),
      );
    }
    next();
  };

export const requireAdmin = requireRole("operator", "owner");
export const requireOwner = requireRole("owner");
