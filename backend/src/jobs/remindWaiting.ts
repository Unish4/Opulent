import { ENV } from "../config/env.js";
import { Order } from "../models/Order.js";
import { Refund } from "../models/Refund.js";
import { sendAdminAlert } from "../services/notify.service.js";
import { formatNpr } from "../utils/money.js";

export const remindWaiting = async (): Promise<{ orders: number; refunds: number; sent: boolean }> => {
  const now = Date.now();
  const waitingBefore = new Date(now - ENV.REMINDER_AFTER_MINUTES * 60_000);
  const remindedBefore = new Date(now - ENV.REMINDER_REPEAT_MINUTES * 60_000);
  const notRecentlyReminded = {
    $or: [{ lastReminderAt: null }, { lastReminderAt: { $lt: remindedBefore } }],
  };

  const [orders, refunds] = await Promise.all([
    Order.find({
      status: "awaiting_review",
      proofSignalAt: { $lt: waitingBefore },
      ...notRecentlyReminded,
    })
      .sort({ proofSignalAt: 1 })
      .limit(15),
    Refund.find({ status: "requested", createdAt: { $lt: waitingBefore }, ...notRecentlyReminded })
      .sort({ createdAt: 1 })
      .limit(15),
  ]);

  if (orders.length === 0 && refunds.length === 0) return { orders: 0, refunds: 0, sent: false };

  const lines: string[] = ["Waiting too long"];
  if (orders.length > 0) {
    lines.push("Orders to review:");
    for (const order of orders) {
      const minutes = Math.round((now - (order.proofSignalAt?.getTime() ?? now)) / 60_000);
      lines.push(
        `- ${order.reference} · ${order.gameSnapshot.name} · ${formatNpr(order.pricePaisaSnapshot)} · ${minutes} min`,
      );
    }
  }
  if (refunds.length > 0) {
    lines.push("Refund requests:");
    for (const refund of refunds) {
      lines.push(`- ${refund.orderReference ?? "no order"} · ${formatNpr(refund.amountPaisa)}`);
    }
  }
  lines.push(`${ENV.CLIENT_URL}/admin/orders?status=awaiting_review`);

  const sent = await sendAdminAlert(lines.join("\n"));
  if (!sent) return { orders: orders.length, refunds: refunds.length, sent: false };

  const reminderTime = new Date();
  await Promise.all([
    Order.updateMany({ _id: { $in: orders.map((order) => order._id) } }, { $set: { lastReminderAt: reminderTime } }),
    Refund.updateMany({ _id: { $in: refunds.map((refund) => refund._id) } }, { $set: { lastReminderAt: reminderTime } }),
  ]);

  return { orders: orders.length, refunds: refunds.length, sent: true };
};