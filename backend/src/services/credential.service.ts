import { Order } from "../models/Order.js";
import { ApiError } from "../utils/ApiError.js";
import { canRevealPassword } from "../utils/credentialAccess.js";
import { decryptSecret } from "../utils/credentialCrypto.js";
import type { RequestContext } from "../utils/requestContext.js";
import { writeAuditLog } from "./audit.service.js";

export const revealOrderPassword = async (
  { actor, requestId }: RequestContext,
  orderId: string,
): Promise<string> => {
  const order = await Order.findById(orderId).select("+credentialSecret");
  if (!order) throw new ApiError(404, "Order not found");

  if (!canRevealPassword(order, actor) || !order.credentialSecret) {
    throw new ApiError(403, "You cannot view the password of this order.");
  }

  let password: string;
  try {
    password = decryptSecret(order.credentialSecret, order.reference);
  } catch {
    throw new ApiError(
      409,
      "The saved password could not be read. Ask the customer to place a new order.",
    );
  }

  await Order.updateOne(
    { _id: order._id },
    { $inc: { credentialRevealCount: 1 } },
  );
  await writeAuditLog({
    actorUserId: actor._id,
    action: "order_credential_revealed",
    targetType: "Order",
    targetId: String(order._id),
    change: { reference: order.reference },
    requestId,
  });

  return password;
};
