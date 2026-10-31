import { ENV } from "../config/env.js";
import { Order } from "../models/Order.js";
import { applyTransition } from "../services/orderTransition.service.js";
import { logger } from "../utils/logger.js";

export const cleanupStaleOrders = async (): Promise<{
  cancelled: number;
  total: number;
}> => {
  const cutoff = new Date(Date.now() - ENV.STALE_ORDER_HOURS * 3_600_000);

  const stale = await Order.find({
    status: "pending_payment",
    paymentStatus: "unpaid",
    createdAt: { $lt: cutoff },
  })
    .select("_id reference")
    .limit(500);

  let cancelled = 0;
  for (const order of stale) {
    try {
      await applyTransition({
        orderId: String(order._id),
        action: "staleCleanup",
        actor: { type: "system" },
        input: { staleAfterHours: ENV.STALE_ORDER_HOURS },
      });
      cancelled += 1;
    } catch (err) {
      logger.warn(
        { err, reference: order.reference },
        "Stale cleanup skipped an order",
      );
    }
  }

  return { cancelled, total: stale.length };
};
