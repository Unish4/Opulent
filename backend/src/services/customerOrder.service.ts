import { Order } from "../models/Order.js";
import { Refund } from "../models/Refund.js";
import { TimelineEvent } from "../models/TimelineEvent.js";
import type { IUser } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { toCustomerOrderDetail } from "../utils/toCustomerOrderDto.js";
import type { MyOrdersQuery } from "../validators/customerOrder.validator.js";
import { getRefundableAmount } from "./refund.service.js";

const GROUPS: Record<string, string[]> = {
  active: [
    "pending_payment",
    "awaiting_review",
    "processing",
    "on_hold",
    "failed",
  ],
  completed: ["completed"],
  closed: ["rejected", "cancelled"],
};

export const listOrdersForUser = async (
  user: IUser,
  { group, page, limit }: MyOrdersQuery,
) => {
  const filter: Record<string, unknown> = { userId: user._id };
  if (group && group !== "all") filter.status = { $in: GROUPS[group] };

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  return { orders, total };
};

export const getOrderDetailForUser = async (user: IUser, reference: string) => {
  const order = await Order.findOne({ reference, userId: user._id });
  if (!order) throw new ApiError(404, "Order not found");

  const [events, refunds] = await Promise.all([
    TimelineEvent.find({ orderId: order._id, customerVisible: true }).sort({
      createdAt: 1,
    }),
    Refund.find({ orderId: order._id }).sort({ createdAt: 1 }),
  ]);

  const hasOpenRefund = refunds.some(
    (refund) => refund.status === "requested" || refund.status === "approved",
  );
  const refundable = await getRefundableAmount(order);

  return toCustomerOrderDetail(order, events, refunds, {
    canCancel:
      order.status === "pending_payment" && order.paymentStatus === "unpaid",
    canRequestRefund:
      order.paymentStatus === "confirmed" &&
      ["failed", "completed"].includes(order.status) &&
      !hasOpenRefund &&
      refundable > 0,
  });
};
