import type { IOrder } from "../models/Order.js";
import type { IUser } from "../models/User.js";

export const REVEALABLE_STATUSES = ["processing", "on_hold", "failed"];

export const canRevealPassword = (order: IOrder, viewer: IUser): boolean =>
  Boolean(order.hasCredential) &&
  REVEALABLE_STATUSES.includes(order.status) &&
  (viewer.role === "owner" ||
    (!!order.claimedBy && String(order.claimedBy) === String(viewer._id)));
