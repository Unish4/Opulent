import type { IRefund } from "../models/Refund.js";
import type { UserMap } from "./toAdminOrderDto.js";

const nameOf = (users: UserMap, id: unknown): string | null =>
  id ? (users.get(String(id))?.name ?? null) : null;

export const toAdminRefundDto = (refund: IRefund, users: UserMap) => ({
  id: String(refund._id),
  orderId: refund.orderId ? String(refund.orderId) : null,
  orderReference: refund.orderReference ?? null,
  amountPaisa: refund.amountPaisa,
  reasonCode: refund.reasonCode,
  note: refund.note,
  status: refund.status,
  incomingEsewaTxnIds: refund.incomingEsewaTxnIds,
  requestedByType: refund.requestedByType,
  requestedByName: nameOf(users, refund.requestedBy),
  customerName: nameOf(users, refund.userId),
  decidedByName: nameOf(users, refund.decidedBy),
  decidedAt: refund.decidedAt ?? null,
  decisionNote: refund.decisionNote ?? null,
  paidOutTxnId: refund.paidOutTxnId ?? null,
  paidOutAt: refund.paidOutAt ?? null,
  createdAt: refund.createdAt,
});

export const toCustomerRefundDto = (refund: IRefund) => ({
  id: String(refund._id),
  status: refund.status,
  amountPaisa: refund.amountPaisa,
  reasonCode: refund.reasonCode,
  decisionNote:
    refund.status === "denied" ? (refund.decisionNote ?? null) : null,
  paidOutTxnId:
    refund.status === "paid_out" ? (refund.paidOutTxnId ?? null) : null,
  createdAt: refund.createdAt,
  decidedAt: refund.decidedAt ?? null,
  paidOutAt: refund.paidOutAt ?? null,
});
