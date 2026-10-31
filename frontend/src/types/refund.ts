export type RefundStatus = "requested" | "approved" | "denied" | "paid_out";

export type RefundReason =
  | "failed_topup"
  | "wrong_account"
  | "not_received"
  | "overpayment"
  | "duplicate_payment"
  | "wrong_order_payment"
  | "late_payment"
  | "admin_mistake"
  | "cancelled_after_payment"
  | "other";

export interface AdminRefund {
  id: string;
  orderId: string | null;
  orderReference: string | null;
  amountPaisa: number;
  reasonCode: RefundReason;
  note: string;
  status: RefundStatus;
  incomingEsewaTxnIds: string[];
  requestedByType: "customer" | "admin";
  requestedByName: string | null;
  customerName: string | null;
  decidedByName: string | null;
  decidedAt: string | null;
  decisionNote: string | null;
  paidOutTxnId: string | null;
  paidOutAt: string | null;
  createdAt: string;
}

export interface AdminRefundsResult {
  refunds: AdminRefund[];
  meta: { page: number; limit: number; total: number };
}

export interface AdminRefundPayload {
  orderReference?: string;
  reasonCode: RefundReason;
  amountNpr: number;
  incomingEsewaTxnId?: string;
  note: string;
}
