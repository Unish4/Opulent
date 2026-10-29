import { connectDB, disconnectDB } from "../config/db.js";
import { ENV } from "../config/env.js";
import { User } from "../models/User.js";
import { writeAuditLog } from "../services/audit.service.js";

const run = async (): Promise<void> => {
  if (ENV.OWNER_EMAILS.length === 0) {
    console.log("OWNER_EMAILS is empty. Nothing to do.");
    return;
  }

  await connectDB();
  for (const email of ENV.OWNER_EMAILS) {
    const user = await User.findOneAndUpdate(
      { email, role: { $ne: "owner" }, status: "active" },
      { role: "owner" },
      { new: true },
    );
    if (!user) {
      console.log(`${email}: no matching non-owner account`);
      continue;
    }
    await writeAuditLog({
      action: "owner_bootstrapped",
      targetType: "User",
      targetId: String(user._id),
      change: { role: "owner", source: "seedOwner script" },
    });
    console.log(`${email}: promoted to owner`);
  }
};

run()
  .catch((err) => {
    console.error(
      "seed:owner failed:",
      err instanceof Error ? err.message : err,
    );
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
