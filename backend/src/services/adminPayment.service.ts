import { PaymentConfig, type IPaymentConfig } from "../models/PaymentConfig.js";
import { diffFields } from "../utils/diffFields.js";
import type { RequestContext } from "../utils/requestContext.js";
import type { PaymentConfigBody } from "../validators/paymentConfig.validator.js";
import { writeAuditLog } from "./audit.service.js";

const snapshot = (config: IPaymentConfig | null) => ({
  methodLabel: config?.methodLabel ?? null,
  recipientName: config?.recipientName ?? null,
  qrImageUrl: config?.qrImageUrl ?? null,
  whatsappNumber: config?.whatsappNumber ?? null,
  instructions: config?.instructions ?? null,
});

export const getAdminPaymentConfig = () =>
  PaymentConfig.findOne({ key: "default" });

export const updatePaymentConfig = async (
  { actor, requestId }: RequestContext,
  input: PaymentConfigBody,
): Promise<IPaymentConfig> => {
  const existing = await PaymentConfig.findOne({ key: "default" });
  const before = snapshot(existing);

  const config = await PaymentConfig.findOneAndUpdate(
    { key: "default" },
    { $set: input },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );

  const changed = diffFields(
    before,
    snapshot(config),
    Object.keys(before) as (keyof typeof before)[],
  );
  if (Object.keys(changed).length > 0) {
    await writeAuditLog({
      actorUserId: actor._id,
      action: "payment_config_changed",
      targetType: "PaymentConfig",
      targetId: "default",
      change: changed,
      requestId,
    });
  }

  return config;
};
