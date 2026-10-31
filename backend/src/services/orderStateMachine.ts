import {
  ORDER_TRANSITIONS,
  type ActorKind,
  type OrderAction,
  type OrderStatus,
  type PaymentStatus,
} from "../constants/orderTransitions.js";
import { ApiError } from "../utils/ApiError.js";
import { formatNpr } from "../utils/money.js";

export type Actor =
  | { type: "customer"; userId: string }
  | { type: "admin"; userId: string; role: "operator" | "owner" }
  | { type: "system" };

export interface OrderState {
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  userId: string;
  claimedBy: string | null;
  holdPreviousStatus: OrderStatus | null;
  pricePaisa: number;
  createdAt: Date;
}

export interface PaymentInput {
  esewaTxnId: string;
  amountPaisa: number;
}

export interface TransitionInput {
  reason?: string;
  note?: string;
  payments?: PaymentInput[];
  excessAcknowledged?: boolean;
  seenPlayerName?: string;
  claimantId?: string;
  now?: Date;
  staleAfterHours?: number;
}

export type TransitionPlan =
  | { noop: true }
  | {
      noop: false;
      nextStatus: OrderStatus;
      nextPaymentStatus: PaymentStatus;
      set: Record<string, unknown>;
      customerVisible: boolean;
      note?: string;
      auditChange: Record<string, unknown>;
    };

const TXN_ID = /^[A-Za-z0-9-]{4,40}$/;

const actorKind = (actor: Actor): ActorKind =>
  actor.type === "admin" ? actor.role : actor.type;

const requireText = (
  value: string | undefined,
  label: string,
  max = 500,
): string => {
  const text = value?.trim() ?? "";
  if (!text) throw new ApiError(400, `${label} is required.`);
  if (text.length > max) throw new ApiError(400, `${label} is too long.`);
  return text;
};

const requireClaimant = (claimantId: string | undefined): string => {
  if (!claimantId)
    throw new ApiError(400, "Choose which admin takes this order.");
  return claimantId;
};

export const planTransition = (
  state: OrderState,
  action: OrderAction,
  actor: Actor,
  input: TransitionInput = {},
): TransitionPlan => {
  const rule = ORDER_TRANSITIONS[action];
  const kind = actorKind(actor);
  const now = input.now ?? new Date();

  if (!rule.actors.includes(kind)) {
    throw new ApiError(403, "You do not have permission to do this.");
  }
  if (actor.type === "customer" && actor.userId !== state.userId) {
    throw new ApiError(404, "Order not found");
  }

  if (
    action === "signalProof" &&
    state.status === "awaiting_review" &&
    state.paymentStatus === "claimed"
  ) {
    return { noop: true };
  }

  if (!rule.from.includes(state.status)) {
    throw new ApiError(
      409,
      `This order is ${state.status.replace("_", " ")} and cannot be changed this way.`,
    );
  }
  if (rule.paymentFrom && !rule.paymentFrom.includes(state.paymentStatus)) {
    throw new ApiError(
      409,
      "The payment status of this order does not allow this action.",
    );
  }
  if (
    rule.claimantOnly &&
    actor.type === "admin" &&
    actor.role === "operator" &&
    state.claimedBy &&
    state.claimedBy !== actor.userId
  ) {
    throw new ApiError(
      403,
      "Only the admin who claimed this order, or an owner, can do this.",
    );
  }

  const nextStatus: OrderStatus =
    rule.to === "previous"
      ? (state.holdPreviousStatus ?? "awaiting_review")
      : rule.to === "same"
        ? state.status
        : rule.to;
  const nextPaymentStatus: PaymentStatus =
    rule.paymentTo ?? state.paymentStatus;
  const actorId = actor.type === "system" ? null : actor.userId;
  const set: Record<string, unknown> = {};
  const auditChange: Record<string, unknown> = {};
  let note = input.reason?.trim() || input.note?.trim() || undefined;

  switch (action) {
    case "signalProof":
      set.proofSignalAt = now;
      break;

    case "confirmPayment": {
      const payments = (input.payments ?? []).map((payment) => ({
        esewaTxnId: payment.esewaTxnId.trim().toUpperCase(),
        amountPaisa: payment.amountPaisa,
      }));
      if (payments.length < 1 || payments.length > 5) {
        throw new ApiError(400, "Enter between 1 and 5 eSewa payments.");
      }
      const seen = new Set<string>();
      for (const payment of payments) {
        if (!TXN_ID.test(payment.esewaTxnId)) {
          throw new ApiError(
            400,
            "An eSewa transaction ID must be 4 to 40 letters, numbers or dashes.",
          );
        }
        if (
          !Number.isSafeInteger(payment.amountPaisa) ||
          payment.amountPaisa <= 0
        ) {
          throw new ApiError(
            400,
            "Each payment amount must be greater than zero.",
          );
        }
        if (seen.has(payment.esewaTxnId)) {
          throw new ApiError(400, "The same transaction ID was entered twice.");
        }
        seen.add(payment.esewaTxnId);
      }
      const total = payments.reduce(
        (sum, payment) => sum + payment.amountPaisa,
        0,
      );
      if (total < state.pricePaisa) {
        throw new ApiError(
          409,
          `Payments add up to ${formatNpr(total)}, less than the order price of ${formatNpr(state.pricePaisa)}. Put the order on hold instead.`,
        );
      }
      const overpaid = total - state.pricePaisa;
      if (overpaid > 0 && !input.excessAcknowledged) {
        throw new ApiError(
          409,
          `Payments exceed the price by ${formatNpr(overpaid)}. Confirm that the excess will be refunded.`,
        );
      }
      set.paymentConfirmation = {
        payments,
        totalReceivedPaisa: total,
        overpaidPaisa: overpaid,
        confirmedBy: actorId,
        confirmedAt: now,
      };
      set.claimedBy = actorId;
      set.claimedAt = now;
      set.paymentConfirmedAt = now;
      auditChange.payments = payments;
      auditChange.totalReceivedPaisa = total;
      auditChange.overpaidPaisa = overpaid;
      break;
    }

    case "rejectPayment":
      note = requireText(input.reason, "A reason");
      set.rejectedAt = now;
      set.rejectionReason = note;
      auditChange.reason = note;
      break;

    case "hold":
      note = requireText(input.reason, "A reason");
      set.heldAt = now;
      set.holdReason = note;
      set.holdPreviousStatus = state.status;
      auditChange.reason = note;
      break;

    case "releaseHold":
      set.heldAt = null;
      set.holdReason = null;
      set.holdPreviousStatus = null;
      break;

    case "complete": {
      const seenName = requireText(
        input.seenPlayerName,
        "The in-game name you saw",
        60,
      );
      set.completedAt = now;
      set.completion = { seenPlayerName: seenName, completedBy: actorId };
      auditChange.seenPlayerName = seenName;
      break;
    }

    case "fail":
      note = requireText(input.reason, "A reason");
      set.failedAt = now;
      set.failureReason = note;
      auditChange.reason = note;
      break;

    case "retry":
      set.failedAt = null;
      set.failureReason = null;
      break;

    case "cancelByCustomer":
      set.cancelledAt = now;
      set.cancellationReason = "Cancelled by customer";
      break;

    case "cancelByAdmin":
      note = requireText(input.reason, "A reason");
      set.cancelledAt = now;
      set.cancellationReason = note;
      auditChange.reason = note;
      break;

    case "staleCleanup": {
      const hours = input.staleAfterHours;
      if (!hours || hours < 1)
        throw new ApiError(400, "staleAfterHours is required.");
      if (now.getTime() - state.createdAt.getTime() < hours * 3_600_000) {
        throw new ApiError(409, "This order is not old enough to clean up.");
      }
      set.cancelledAt = now;
      set.cancellationReason = "Cancelled automatically: no payment received";
      break;
    }

    case "reassignClaim": {
      const claimantId = requireClaimant(input.claimantId);
      set.claimedBy = claimantId;
      set.claimedAt = now;
      auditChange.claimedBy = claimantId;
      break;
    }

    case "reopen": {
      note = requireText(input.reason, "A reason");
      const claimantId = requireClaimant(input.claimantId);
      set.claimedBy = claimantId;
      set.claimedAt = now;
      set.completedAt = null;
      set.reopenedAt = now;
      set.reopenReason = note;
      auditChange.reason = note;
      auditChange.claimedBy = claimantId;
      break;
    }
  }

  return {
    noop: false,
    nextStatus,
    nextPaymentStatus,
    set,
    customerVisible: rule.customerVisible,
    note,
    auditChange,
  };
};
