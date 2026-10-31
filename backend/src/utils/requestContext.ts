import type { Request } from "express";
import type { IUser } from "../models/User.js";

export interface RequestContext {
  actor: IUser;
  requestId: string;
}

export const getContext = (req: Request): RequestContext => ({
  actor: req.appUser!,
  requestId: String(req.id),
});
