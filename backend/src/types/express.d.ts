import type { IUser } from "../models/User.js";

declare global {
  namespace Express {
    interface Request {
      appUser?: IUser;
    }
  }
}

export {};
