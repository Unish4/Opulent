import { Order } from "../models/Order.js";

export const purgeCredentials = async (): Promise<{ wiped: number }> => {
  const now = Date.now();
  const failedBefore = new Date(now - 7 * 86_400_000);
  const anyBefore = new Date(now - 14 * 86_400_000);

  const result = await Order.updateMany(
    {
      hasCredential: true,
      $or: [
        { status: { $in: ["completed", "cancelled", "rejected"] } },
        { status: "failed", updatedAt: { $lt: failedBefore } },
        { createdAt: { $lt: anyBefore } },
      ],
    },
    {
      $unset: { credentialSecret: 1 },
      $set: { hasCredential: false, credentialWipedAt: new Date() },
    },
  );

  return { wiped: result.modifiedCount };
};
