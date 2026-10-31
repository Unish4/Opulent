import { connectDB, disconnectDB } from "../config/db.js";
import { ENV } from "../config/env.js";
import { Order } from "../models/Order.js";
import { applyTransition } from "../services/orderTransition.service.js";

const run = async (): Promise<void> => {
  await connectDB();

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
      console.error(
        `${order.reference}: ${err instanceof Error ? err.message : err}`,
      );
    }
  }

  console.log(`Stale orders cancelled: ${cancelled} of ${stale.length}`);
};

run()
  .catch((err) => {
    console.error(
      "cleanup:stale failed:",
      err instanceof Error ? err.message : err,
    );
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
