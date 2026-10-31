import type { RefundReason } from "../types/refund";

export const CUSTOMER_EVENT_LABELS: Record<string, string> = {
  created: "Order placed",
  signalProof: "You told us you sent your proof",
  confirmPayment: "Payment confirmed",
  rejectPayment: "Payment rejected",
  hold: "Order put on hold",
  releaseHold: "Hold released",
  complete: "Top-up completed",
  fail: "Top-up failed",
  retry: "We are trying your top-up again",
  cancelByCustomer: "You cancelled the order",
  cancelByAdmin: "Order cancelled",
  staleCleanup: "Cancelled automatically: no payment received",
  reopen: "Order reopened",
  refund_requested: "Refund requested",
  refund_approved: "Refund approved",
  refund_denied: "Refund declined",
  refund_paid: "Refund sent to your eSewa account",
};

export const REFUND_REASON_LABELS: Record<RefundReason, string> = {
  failed_topup: "Top-up failed",
  wrong_account: "Delivered to the wrong account",
  not_received: "I did not receive my top-up",
  overpayment: "Overpayment",
  duplicate_payment: "Duplicate payment",
  wrong_order_payment: "Payment for the wrong order",
  late_payment: "Payment after the order was cancelled",
  admin_mistake: "Our mistake",
  cancelled_after_payment: "Cancelled after payment",
  other: "Other",
};

export const CUSTOMER_REFUND_REASONS: RefundReason[] = [
  "failed_topup",
  "wrong_account",
  "not_received",
  "other",
];
