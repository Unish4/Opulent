import type { Types } from "mongoose";
import { ORDER_STATUSES } from "../constants/orderTransitions.js";
import { Order } from "../models/Order.js";
import { TimelineEvent } from "../models/TimelineEvent.js";
import { User, type IUser } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import {
  toAdminOrderDetail,
  toAdminOrderListItem,
  type UserMap,
} from "../utils/toAdminOrderDto.js";
import type { ListOrdersQuery } from "../validators/adminOrder.validator.js";

const ACTIVE_STATUSES = [
  "pending_payment",
  "awaiting_review",
  "processing",
  "on_hold",
  "failed",
];

const loadUserMap = async (
  ids: (Types.ObjectId | string | null | undefined)[],
): Promise<UserMap> => {
  const unique = [...new Set(ids.filter(Boolean).map(String))];
  if (unique.length === 0) return new Map();
  const users = await User.find({ _id: { $in: unique } });
  return new Map(users.map((user) => [String(user._id), user]));
};

const startOfDay = (date: string): Date =>
  new Date(`${date}T00:00:00.000+05:45`);
const endOfDay = (date: string): Date => new Date(`${date}T23:59:59.999+05:45`);

export const listAdminOrders = async (
  viewer: IUser,
  query: ListOrdersQuery,
) => {
  const filter: Record<string, unknown> = {};

  if (query.status) filter.status = query.status;
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
  if (query.game) filter["gameSnapshot.slug"] = query.game;
  if (query.assignee === "me") filter.claimedBy = viewer._id;
  if (query.assignee === "unclaimed") filter.claimedBy = null;

  if (query.dateFrom || query.dateTo) {
    const range: Record<string, Date> = {};
    if (query.dateFrom) range.$gte = startOfDay(query.dateFrom);
    if (query.dateTo) range.$lte = endOfDay(query.dateTo);
    filter.createdAt = range;
  }

  if (query.q) {
    const term = query.q.trim();
    if (/^op-/i.test(term)) {
      filter.reference = new RegExp(`^${escapeRegex(term.toUpperCase())}`);
    } else if (term.includes("@")) {
      const matches = await User.find({ email: term.toLowerCase() }).select(
        "_id",
      );
      filter.userId = { $in: matches.map((user) => user._id) };
    } else {
      filter.$or = [
        { "playerDetails.playerId": term },
        { "playerDetails.email": term.toLowerCase() },
      ];
    }
  }

  const direction =
    query.sort ??
    (query.status && ACTIVE_STATUSES.includes(query.status)
      ? "oldest"
      : "newest");

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: direction === "oldest" ? 1 : -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit),
    Order.countDocuments(filter),
  ]);

  const users = await loadUserMap(
    orders.flatMap((order) => [order.userId, order.claimedBy]),
  );
  return {
    orders: orders.map((order) => toAdminOrderListItem(order, users)),
    total,
  };
};

export const getOrderSummary = async () => {
  const rows = await Order.aggregate<{ _id: string; count: number }>([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const counts: Record<string, number> = Object.fromEntries(
    ORDER_STATUSES.map((status) => [status, 0]),
  );
  for (const row of rows) counts[row._id] = row.count;
  return counts;
};

export const getAdminOrderDetail = async (viewer: IUser, id: string) => {
  const order = await Order.findById(id);
  if (!order) throw new ApiError(404, "Order not found");

  const events = await TimelineEvent.find({ orderId: order._id }).sort({
    createdAt: 1,
  });
  const users = await loadUserMap([
    order.userId,
    order.claimedBy,
    order.paymentConfirmation?.confirmedBy,
    order.completion?.completedBy,
    ...events.map((event) => event.actorUserId),
  ]);

  return toAdminOrderDetail(order, users, events, viewer);
};
