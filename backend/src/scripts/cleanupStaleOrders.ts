import { connectDB, disconnectDB } from "../config/db.js";
import { cleanupStaleOrders } from "../jobs/cleanupStaleOrders.js";

const run = async (): Promise<void> => {
  await connectDB();
  const result = await cleanupStaleOrders();
  console.log(`Stale orders cancelled: ${result.cancelled} of ${result.total}`);
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
