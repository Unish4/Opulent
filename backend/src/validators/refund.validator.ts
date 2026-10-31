import { z } from "zod";
import { REFUND_REASONS, REFUND_STATUSES } from "../models/Refund.js";

const twoDecimals = (value: number): boolean =>
  Math.abs(value * 100 - Math.round(value * 100)) < 1e-6;
const txnId = z
  .string()
  .trim()
  .min(4)
  .max(40)
  .regex(/^[A-Za-z0-9-]+$/, "Letters, numbers and dashes only");
const reference = z
  .string()
  .regex(/^OP-[A-HJ-NP-Z2-9]{8}$/, "Invalid order reference");

export const customerRefundSchema = z
  .object({
    reasonCode: z.enum([
      "failed_topup",
      "wrong_account",
      "not_received",
      "other",
    ]),
    note: z.string().trim().min(5, "Please tell us a little more").max(500),
  })
  .strict();

export const adminRefundSchema = z
  .object({
    orderReference: reference.optional(),
    reasonCode: z.enum(REFUND_REASONS),
    amountNpr: z
      .number()
      .positive()
      .max(100000)
      .refine(twoDecimals, "Use at most 2 decimal places"),
    incomingEsewaTxnId: txnId.optional(),
    note: z.string().trim().min(3).max(500),
  })
  .strict();

export const approveRefundSchema = z
  .object({ note: z.string().trim().max(500).optional() })
  .strict();
export const denyRefundSchema = z
  .object({ note: z.string().trim().min(1, "A reason is required").max(500) })
  .strict();
export const markPaidSchema = z.object({ paidOutTxnId: txnId }).strict();

export const listRefundsQuerySchema = z.object({
  status: z.enum(REFUND_STATUSES).optional(),
  order: reference.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CustomerRefundBody = z.infer<typeof customerRefundSchema>;
export type AdminRefundBody = z.infer<typeof adminRefundSchema>;
export type ListRefundsQuery = z.infer<typeof listRefundsQuerySchema>;
