import {
  ORDER_TRANSITIONS,
  type ActorKind,
  type OrderAction,
} from "../constants/orderTransitions.js";
import type { IOrder } from "../models/Order.js";
import type { IUser } from "../models/User.js";

export const getAllowedActions = (
  order: IOrder,
  viewer: IUser,
): OrderAction[] =>
  (Object.keys(ORDER_TRANSITIONS) as OrderAction[]).filter((action) => {
    const rule = ORDER_TRANSITIONS[action];
    if (!rule.actors.includes(viewer.role as ActorKind)) return false;
    if (!rule.from.includes(order.status)) return false;
    if (rule.paymentFrom && !rule.paymentFrom.includes(order.paymentStatus))
      return false;
    if (
      rule.claimantOnly &&
      viewer.role === "operator" &&
      order.claimedBy &&
      String(order.claimedBy) !== String(viewer._id)
    ) {
      return false;
    }
    return true;
  });
