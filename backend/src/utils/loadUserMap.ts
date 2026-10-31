import type { Types } from "mongoose";
import { User } from "../models/User.js";
import type { UserMap } from "./toAdminOrderDto.js";

export const loadUserMap = async (
  ids: (Types.ObjectId | string | null | undefined)[],
): Promise<UserMap> => {
  const unique = [...new Set(ids.filter(Boolean).map(String))];
  if (unique.length === 0) return new Map();
  const users = await User.find({ _id: { $in: unique } });
  return new Map(users.map((user) => [String(user._id), user]));
};
