export const ORDER_STATUSES = [
  "pending_payment",
  "awaiting_review",
  "processing",
  "on_hold",
  "completed",
  "failed",
  "rejected",
  "cancelled",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = [
  "unpaid",
  "claimed",
  "confirmed",
  "rejected",
  "refunded",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export type ActorKind = "customer" | "operator" | "owner" | "system";

export const ORDER_ACTIONS = [
  "signalProof",
  "confirmPayment",
  "rejectPayment",
  "hold",
  "releaseHold",
  "complete",
  "fail",
  "retry",
  "cancelByCustomer",
  "cancelByAdmin",
  "staleCleanup",
  "reassignClaim",
  "reopen",
] as const;
export type OrderAction = (typeof ORDER_ACTIONS)[number];

export interface TransitionRule {
  from: OrderStatus[];
  to: OrderStatus | "previous" | "same";
  actors: ActorKind[];
  paymentFrom?: PaymentStatus[];
  paymentTo?: PaymentStatus;
  claimantOnly?: boolean;
  customerVisible: boolean;
}

const ADMINS: ActorKind[] = ["operator", "owner"];

export const ORDER_TRANSITIONS: Record<OrderAction, TransitionRule> = {
  signalProof: {
    from: ["pending_payment"],
    to: "awaiting_review",
    actors: ["customer"],
    paymentFrom: ["unpaid"],
    paymentTo: "claimed",
    customerVisible: true,
  },
  confirmPayment: {
    from: ["pending_payment", "awaiting_review"],
    to: "processing",
    actors: ADMINS,
    paymentFrom: ["unpaid", "claimed"],
    paymentTo: "confirmed",
    customerVisible: true,
  },
  rejectPayment: {
    from: ["pending_payment", "awaiting_review"],
    to: "rejected",
    actors: ADMINS,
    paymentFrom: ["unpaid", "claimed"],
    paymentTo: "rejected",
    customerVisible: true,
  },
  hold: {
    from: ["awaiting_review", "processing"],
    to: "on_hold",
    actors: ADMINS,
    customerVisible: true,
  },
  releaseHold: {
    from: ["on_hold"],
    to: "previous",
    actors: ADMINS,
    claimantOnly: true,
    customerVisible: true,
  },
  complete: {
    from: ["processing"],
    to: "completed",
    actors: ADMINS,
    paymentFrom: ["confirmed"],
    claimantOnly: true,
    customerVisible: true,
  },
  fail: {
    from: ["processing"],
    to: "failed",
    actors: ADMINS,
    paymentFrom: ["confirmed"],
    claimantOnly: true,
    customerVisible: true,
  },
  retry: {
    from: ["failed"],
    to: "processing",
    actors: ADMINS,
    claimantOnly: true,
    customerVisible: true,
  },
  cancelByCustomer: {
    from: ["pending_payment"],
    to: "cancelled",
    actors: ["customer"],
    paymentFrom: ["unpaid"],
    customerVisible: true,
  },
  cancelByAdmin: {
    from: [
      "pending_payment",
      "awaiting_review",
      "on_hold",
      "failed",
      "processing",
    ],
    to: "cancelled",
    actors: ADMINS,
    paymentFrom: ["unpaid", "claimed", "rejected", "refunded"],
    customerVisible: true,
  },
  staleCleanup: {
    from: ["pending_payment"],
    to: "cancelled",
    actors: ["system"],
    paymentFrom: ["unpaid"],
    customerVisible: true,
  },
  reassignClaim: {
    from: ["processing", "on_hold", "failed"],
    to: "same",
    actors: ["owner"],
    customerVisible: false,
  },
  reopen: {
    from: ["completed"],
    to: "processing",
    actors: ["owner"],
    paymentFrom: ["confirmed"],
    customerVisible: true,
  },
};
