import mongoose from "mongoose";
import { Order, type IOrder } from "../models/Order.js";
import { Refund, REFUND_STATUSES, type IRefund } from "../models/Refund.js";
import type { IUser } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { loadUserMap } from "../utils/loadUserMap.js";
import { logger } from "../utils/logger.js";
import { formatNpr, nprToPaisa } from "../utils/money.js";
import { toAdminRefundDto } from "../utils/toRefundDto.js";
import type {
  AdminRefundBody,
  CustomerRefundBody,
  ListRefundsQuery,
} from "../validators/refund.validator.js";
import { writeAuditLog } from "./audit.service.js";
import { applyTransition } from "./orderTransition.service.js";

interface RefundContext {
  actor: IUser;
  requestId: string;
}

const COUNTED_STATUSES = ["requested", "approved", "paid_out"];

const isDuplicateKeyError = (err: unknown): boolean =>
  typeof err === "object" &&
  err !== null &&
  "code" in err &&
  err.code === 11000;

export const getRefundableAmount = async (order: IOrder): Promise<number> => {
  const received = order.paymentConfirmation?.totalReceivedPaisa ?? 0;
  const rows = await Refund.aggregate<{ _id: null; total: number }>([
    { $match: { orderId: order._id, status: { $in: COUNTED_STATUSES } } },
    { $group: { _id: null, total: { $sum: "$amountPaisa" } } },
  ]);
  return Math.max(0, received - (rows[0]?.total ?? 0));
};

export const presentAdminRefund = async (refund: IRefund) => {
  const users = await loadUserMap([
    refund.requestedBy,
    refund.userId,
    refund.decidedBy,
  ]);
  return toAdminRefundDto(refund, users);
};

export const requestRefundAsCustomer = async (
  user: IUser,
  reference: string,
  input: CustomerRefundBody,
  requestId: string,
): Promise<IRefund> => {
  const order = await Order.findOne({ reference, userId: user._id });
  if (!order) throw new ApiError(404, "Order not found");

  if (
    order.paymentStatus !== "confirmed" ||
    !["failed", "completed"].includes(order.status)
  ) {
    throw new ApiError(
      409,
      "A refund cannot be requested for this order right now.",
    );
  }

  const open = await Refund.exists({
    orderId: order._id,
    status: { $in: ["requested", "approved"] },
  });
  if (open)
    throw new ApiError(409, "A refund request for this order is already open.");

  const amountPaisa = await getRefundableAmount(order);
  if (amountPaisa <= 0)
    throw new ApiError(409, "Nothing is left to refund on this order.");

  const refund = await Refund.create({
    orderId: order._id,
    orderReference: order.reference,
    userId: user._id,
    incomingEsewaTxnIds:
      order.paymentConfirmation?.payments.map(
        (payment) => payment.esewaTxnId,
      ) ?? [],
    amountPaisa,
    reasonCode: input.reasonCode,
    note: input.note,
    requestedByType: "customer",
    requestedBy: user._id,
  });

  await writeAuditLog({
    actorUserId: user._id,
    action: "refund_requested",
    targetType: "Refund",
    targetId: String(refund._id),
    reason: input.note,
    change: {
      reference,
      amountPaisa,
      reasonCode: input.reasonCode,
      by: "customer",
    },
    requestId,
  });

  return refund;
};

export const createRefundAsAdmin = async (
  { actor, requestId }: RefundContext,
  input: AdminRefundBody,
): Promise<IRefund> => {
  const amountPaisa = nprToPaisa(input.amountNpr);

  let order: IOrder | null = null;
  if (input.orderReference) {
    order = await Order.findOne({ reference: input.orderReference });
    if (!order) throw new ApiError(404, "Order not found");
  }

  let txns: string[] = [];

  if (order?.paymentConfirmation) {
    const refundable = await getRefundableAmount(order);
    if (amountPaisa > refundable) {
      throw new ApiError(
        409,
        `Only ${formatNpr(refundable)} can still be refunded on this order.`,
      );
    }
    txns = order.paymentConfirmation.payments.map(
      (payment) => payment.esewaTxnId,
    );
  } else {
    if (!input.incomingEsewaTxnId) {
      throw new ApiError(
        400,
        "The original eSewa transaction ID is required for this refund.",
      );
    }
    const txn = input.incomingEsewaTxnId.toUpperCase();
    const duplicate = await Refund.exists({
      incomingEsewaTxnIds: txn,
      status: { $ne: "denied" },
    });
    if (duplicate) {
      throw new ApiError(
        409,
        "A refund for this transaction already exists.",
        "DUPLICATE_RESOURCE",
      );
    }
    txns = [txn];
  }

  const refund = await Refund.create({
    orderId: order?._id ?? null,
    orderReference: order?.reference ?? null,
    userId: order?.userId ?? null,
    incomingEsewaTxnIds: txns,
    amountPaisa,
    reasonCode: input.reasonCode,
    note: input.note,
    requestedByType: "admin",
    requestedBy: actor._id,
  });

  await writeAuditLog({
    actorUserId: actor._id,
    action: "refund_requested",
    targetType: "Refund",
    targetId: String(refund._id),
    reason: input.note,
    change: {
      reference: order?.reference ?? null,
      amountPaisa,
      reasonCode: input.reasonCode,
      incomingEsewaTxnIds: txns,
      by: "admin",
    },
    requestId,
  });

  return refund;
};

export const decideRefund = async (
  { actor, requestId }: RefundContext,
  id: string,
  decision: "approve" | "deny",
  note?: string,
): Promise<IRefund> => {
  const status = decision === "approve" ? "approved" : "denied";

  const refund = await Refund.findOneAndUpdate(
    { _id: id, status: "requested" },
    {
      $set: {
        status,
        decidedBy: actor._id,
        decidedAt: new Date(),
        decisionNote: note ?? null,
      },
    },
    { new: true },
  );

  if (!refund) {
    const exists = await Refund.exists({ _id: id });
    throw exists
      ? new ApiError(409, "This refund request was already handled.")
      : new ApiError(404, "Refund not found");
  }

  await writeAuditLog({
    actorUserId: actor._id,
    action: decision === "approve" ? "refund_approved" : "refund_denied",
    targetType: "Refund",
    targetId: String(refund._id),
    reason: note,
    change: {
      reference: refund.orderReference,
      amountPaisa: refund.amountPaisa,
    },
    requestId,
  });

  return refund;
};

export const markRefundPaid = async (
  { actor, requestId }: RefundContext,
  id: string,
  paidOutTxnId: string,
): Promise<IRefund> => {
  const session = await mongoose.startSession();
  const holder: { refund?: IRefund; refundedOrder?: IOrder } = {};
  const txn = paidOutTxnId.toUpperCase();

  try {
    await session.withTransaction(async () => {
      const refund = await Refund.findOneAndUpdate(
        { _id: id, status: "approved" },
        {
          $set: {
            status: "paid_out",
            paidOutBy: actor._id,
            paidOutAt: new Date(),
            paidOutTxnId: txn,
          },
        },
        { new: true, session },
      );
      if (!refund) {
        const exists = await Refund.exists({ _id: id }).session(session);
        throw exists
          ? new ApiError(409, "Only an approved refund can be marked as paid.")
          : new ApiError(404, "Refund not found");
      }

      if (refund.orderId) {
        const order = await Order.findById(refund.orderId).session(session);
        if (
          order &&
          order.paymentStatus === "confirmed" &&
          order.paymentConfirmation
        ) {
          const rows = await Refund.aggregate<{ _id: null; total: number }>([
            { $match: { orderId: order._id, status: "paid_out" } },
            { $group: { _id: null, total: { $sum: "$amountPaisa" } } },
          ]).session(session);
          const paidTotal = rows[0]?.total ?? 0;

          if (paidTotal >= order.paymentConfirmation.totalReceivedPaisa) {
            const updated = await Order.findOneAndUpdate(
              { _id: order._id, paymentStatus: "confirmed" },
              { $set: { paymentStatus: "refunded" }, $inc: { version: 1 } },
              { new: true, session },
            );
            if (updated) holder.refundedOrder = updated;
          }
        }
      }

      await writeAuditLog({
        actorUserId: actor._id,
        action: "refund_paid_out",
        targetType: "Refund",
        targetId: String(refund._id),
        change: {
          reference: refund.orderReference,
          amountPaisa: refund.amountPaisa,
          paidOutTxnId: txn,
          orderFullyRefunded: !!holder.refundedOrder,
        },
        requestId,
        session,
      });

      holder.refund = refund;
    });
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw new ApiError(
        409,
        "This eSewa refund transaction ID is already used on another refund.",
        "DUPLICATE_RESOURCE",
      );
    }
    throw err;
  } finally {
    await session.endSession();
  }

  if (!holder.refund) throw new ApiError(500, "Refund was not updated");

  const refundedOrder = holder.refundedOrder;
  if (
    refundedOrder &&
    ["failed", "on_hold", "processing"].includes(refundedOrder.status)
  ) {
    try {
      await applyTransition({
        orderId: String(refundedOrder._id),
        action: "cancelByAdmin",
        actor: { type: "admin", userId: String(actor._id), role: "owner" },
        input: { reason: "Refunded in full" },
        requestId,
      });
    } catch (err) {
      logger.warn(
        { err, reference: refundedOrder.reference },
        "Could not cancel refunded order",
      );
    }
  }

  return holder.refund;
};

export const listRefunds = async (query: ListRefundsQuery) => {
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.order) filter.orderReference = query.order;

  const oldestFirst =
    query.status === "requested" || query.status === "approved";

  const [refunds, total] = await Promise.all([
    Refund.find(filter)
      .sort({ createdAt: oldestFirst ? 1 : -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit),
    Refund.countDocuments(filter),
  ]);

  const users = await loadUserMap(
    refunds.flatMap((refund) => [
      refund.requestedBy,
      refund.userId,
      refund.decidedBy,
    ]),
  );
  return {
    refunds: refunds.map((refund) => toAdminRefundDto(refund, users)),
    total,
  };
};

export const getRefundSummary = async () => {
  const rows = await Refund.aggregate<{ _id: string; count: number }>([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const counts: Record<string, number> = Object.fromEntries(
    REFUND_STATUSES.map((status) => [status, 0]),
  );
  for (const row of rows) counts[row._id] = row.count;
  return counts;
};
