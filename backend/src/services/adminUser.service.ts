import { Order } from "../models/Order.js";
import { User, type IUser } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import type { RequestContext } from "../utils/requestContext.js";
import { toAdminUserListItem } from "../utils/toAdminUserDto.js";
import type { ListUsersQuery } from "../validators/adminUser.validator.js";
import { writeAuditLog } from "./audit.service.js";

export const listUsers = async (query: ListUsersQuery) => {
  const filter: Record<string, unknown> = {
    role: query.role || "customer",
  };
  if (query.status) filter.status = query.status;
  if (query.q) {
    const regex = new RegExp(escapeRegex(query.q.trim()), "i");
    filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit),
    User.countDocuments(filter),
  ]);

  const counts = await Order.aggregate<{ _id: unknown; count: number }>([
    { $match: { userId: { $in: users.map((user) => user._id) } } },
    { $group: { _id: "$userId", count: { $sum: 1 } } },
  ]);
  const countById = new Map(counts.map((row) => [String(row._id), row.count]));

  return {
    users: users.map((user) =>
      toAdminUserListItem(user, countById.get(String(user._id)) ?? 0),
    ),
    total,
  };
};

export const getUserDetail = async (id: string) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found");

  const [recent, statusRows, spendRows] = await Promise.all([
    Order.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20),
    Order.aggregate<{ _id: string; count: number }>([
      { $match: { userId: user._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Order.aggregate<{ total: number }>([
      { $match: { userId: user._id, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$pricePaisaSnapshot" } } },
    ]),
  ]);

  const ordersByStatus = Object.fromEntries(
    statusRows.map((row) => [row._id, row.count]),
  );
  const ordersCount = statusRows.reduce((sum, row) => sum + row.count, 0);

  return {
    ...toAdminUserListItem(user, ordersCount),
    ordersByStatus,
    completedSpendPaisa: spendRows[0]?.total ?? 0,
    recentOrders: recent.map((order) => ({
      id: String(order._id),
      reference: order.reference,
      status: order.status,
      gameName: order.gameSnapshot.name,
      packageName: order.packageSnapshot.name,
      pricePaisa: order.pricePaisaSnapshot,
      createdAt: order.createdAt,
    })),
  };
};

export const setUserStatus = async (
  { actor, requestId }: RequestContext,
  id: string,
  status: "active" | "suspended",
  reason?: string,
): Promise<IUser> => {
  if (String(actor._id) === id)
    throw new ApiError(409, "You cannot change your own account status.");

  const target = await User.findById(id);
  if (!target) throw new ApiError(404, "User not found");
  if (target.status === "deleted")
    throw new ApiError(409, "This account was deleted.");
  if (target.role !== "customer") {
    throw new ApiError(
      409,
      "Remove this person's admin access on the Team page first.",
    );
  }
  if (target.status === status) return target;
  if (status === "suspended" && !reason?.trim()) {
    throw new ApiError(400, "A reason is required to suspend an account.");
  }

  const updated = await User.findOneAndUpdate(
    { _id: target._id, status: target.status },
    { status },
    { new: true },
  );
  if (!updated)
    throw new ApiError(
      409,
      "This account was changed by someone else. Reload and retry.",
    );

  await writeAuditLog({
    actorUserId: actor._id,
    action: "user_status_changed",
    targetType: "User",
    targetId: String(target._id),
    reason: reason?.trim() || undefined,
    change: { before: target.status, after: status, email: target.email },
    requestId,
  });

  return updated;
};
