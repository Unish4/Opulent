import mongoose from "mongoose";
import type { OrderAction } from "../constants/orderTransitions.js";
import type { AuditAction } from "../models/AuditLog.js";
import { Order, type IOrder } from "../models/Order.js";
import { TimelineEvent } from "../models/TimelineEvent.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { writeAuditLog } from "./audit.service.js";
import {
  planTransition,
  type Actor,
  type OrderState,
  type TransitionInput,
} from "./orderStateMachine.js";

const AUDIT_FOR_ACTION: Partial<Record<OrderAction, AuditAction>> = {
  confirmPayment: "order_payment_confirmed",
  rejectPayment: "order_payment_rejected",
  hold: "order_held",
  releaseHold: "order_hold_released",
  complete: "order_completed",
  fail: "order_failed",
  retry: "order_retried",
  cancelByAdmin: "order_cancelled",
  reassignClaim: "order_claim_reassigned",
  reopen: "order_reopened",
};

const toState = (order: IOrder): OrderState => ({
  status: order.status,
  paymentStatus: order.paymentStatus,
  userId: String(order.userId),
  claimedBy: order.claimedBy ? String(order.claimedBy) : null,
  holdPreviousStatus: order.holdPreviousStatus ?? null,
  pricePaisa: order.pricePaisaSnapshot,
  createdAt: order.createdAt,
});

const isDuplicateKeyError = (err: unknown): boolean =>
  typeof err === "object" &&
  err !== null &&
  "code" in err &&
  err.code === 11000;

const assertActiveAdmin = async (userId: string): Promise<void> => {
  const admin = await User.exists({
    _id: userId,
    status: "active",
    role: { $in: ["operator", "owner"] },
  });
  if (!admin) throw new ApiError(400, "The selected admin is not available.");
};

export interface ApplyTransitionArgs {
  orderId: string;
  action: OrderAction;
  actor: Actor;
  input?: TransitionInput;
  requestId?: string;
}

export const applyTransition = async ({
  orderId,
  action,
  actor,
  input = {},
  requestId,
}: ApplyTransitionArgs): Promise<IOrder> => {
  if (input.claimantId) await assertActiveAdmin(input.claimantId);

  const session = await mongoose.startSession();
  const holder: { order?: IOrder } = {};

  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);
      if (!order) throw new ApiError(404, "Order not found");

      const plan = planTransition(toState(order), action, actor, input);
      if (plan.noop) {
        holder.order = order;
        return;
      }

      const updated = await Order.findOneAndUpdate(
        { _id: order._id, status: order.status, version: order.version },
        {
          $set: {
            ...plan.set,
            status: plan.nextStatus,
            paymentStatus: plan.nextPaymentStatus,
          },
          $inc: { version: 1 },
        },
        { new: true, session },
      );
      if (!updated) {
        throw new ApiError(
          409,
          "This order was just changed by someone else. Reload and try again.",
          "STATE_CONFLICT",
        );
      }

      await TimelineEvent.create(
        [
          {
            orderId: order._id,
            action,
            fromStatus: order.status,
            toStatus: plan.nextStatus,
            fromPaymentStatus: order.paymentStatus,
            toPaymentStatus: plan.nextPaymentStatus,
            actorType: actor.type,
            actorUserId: actor.type === "system" ? undefined : actor.userId,
            customerVisible: plan.customerVisible,
            note: plan.note,
          },
        ],
        { session },
      );

      const auditAction = AUDIT_FOR_ACTION[action];
      if (auditAction && actor.type === "admin") {
        await writeAuditLog({
          actorUserId: actor.userId,
          action: auditAction,
          targetType: "Order",
          targetId: String(order._id),
          reason: plan.note,
          change: {
            reference: order.reference,
            from: order.status,
            to: plan.nextStatus,
            paymentTo: plan.nextPaymentStatus,
            ...plan.auditChange,
          },
          requestId,
          session,
        });
      }

      holder.order = updated;
    });
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      throw new ApiError(
        409,
        "This eSewa transaction ID is already used on another order.",
        "DUPLICATE_RESOURCE",
      );
    }
    throw err;
  } finally {
    await session.endSession();
  }

  if (!holder.order) throw new ApiError(500, "Transition did not complete");
  return holder.order;
};
