import type { RequestHandler } from "express";
import { getAuth } from "@clerk/express";
import { getOrProvisionUser } from "../services/user.service.js";
import { ApiError } from "../utils/ApiError.js";

export const attachUser: RequestHandler = async (req, _res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) throw new ApiError(401, "Please sign in to continue");

    const user = await getOrProvisionUser(userId);
    if (user.status !== "active")
      throw new ApiError(403, "This account is not active");

    req.appUser = user;
    next();
  } catch (error) {
    next(error);
  }
};
