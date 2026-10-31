import type { IOrder } from "../models/Order.js";
import type { IRefund } from "../models/Refund.js";
import type { ITimelineEvent } from "../models/TimelineEvent.js";
import { toOrderDto } from "./toOrderDto.js";
import { toCustomerRefundDto } from "./toRefundDto.js";

const NOTE_VISIBLE_ACTIONS = ["hold", "rejectPayment", "fail", "cancelByAdmin"];

interface TimelineItem {
  id: string;
  action: string;
  note: string | null;
  createdAt: Date;
}

export const toCustomerListItem = (order: IOrder) => ({
  reference: order.reference,
  status: order.status,
  paymentStatus: order.paymentStatus,
  gameName: order.gameSnapshot.name,
  packageName: order.packageSnapshot.name,
  pricePaisa: order.pricePaisaSnapshot,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

const buildTimeline = (
  events: ITimelineEvent[],
  refunds: IRefund[],
): TimelineItem[] => {
  const items: TimelineItem[] = events.map((event) => ({
    id: String(event._id),
    action: event.action,
    note: NOTE_VISIBLE_ACTIONS.includes(event.action)
      ? (event.note ?? null)
      : null,
    createdAt: event.createdAt,
  }));

  for (const refund of refunds) {
    const id = String(refund._id);
    items.push({
      id: `${id}-requested`,
      action: "refund_requested",
      note: null,
      createdAt: refund.createdAt,
    });
    if (refund.decidedAt && refund.status === "approved") {
      items.push({
        id: `${id}-approved`,
        action: "refund_approved",
        note: null,
        createdAt: refund.decidedAt,
      });
    }
    if (refund.decidedAt && refund.status === "denied") {
      items.push({
        id: `${id}-denied`,
        action: "refund_denied",
        note: refund.decisionNote ?? null,
        createdAt: refund.decidedAt,
      });
    }
    if (refund.paidOutAt) {
      items.push({
        id: `${id}-paid`,
        action: "refund_paid",
        note: refund.paidOutTxnId
          ? `eSewa reference: ${refund.paidOutTxnId}`
          : null,
        createdAt: refund.paidOutAt,
      });
    }
  }

  return items.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
};

export const toCustomerOrderDetail = (
  order: IOrder,
  events: ITimelineEvent[],
  refunds: IRefund[],
  flags: { canCancel: boolean; canRequestRefund: boolean },
) => ({
  ...toOrderDto(order),
  ...flags,
  timeline: buildTimeline(events, refunds),
  refunds: refunds.map(toCustomerRefundDto),
});
