import { connectDB, disconnectDB } from "../config/db.js";
import { remindWaiting } from "../jobs/remindWaiting.js";

const run = async (): Promise<void> => {
  await connectDB();
  const result = await remindWaiting();
  console.log(
    result.sent
      ? `Reminder sent: ${result.orders} orders, ${result.refunds} refunds.`
      : "No reminder sent (nothing waiting, or Telegram not configured).",
  );
};

run()
  .catch((err) => {
    console.error(
      "remind:waiting failed:",
      err instanceof Error ? err.message : err,
    );
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
