import { z } from "zod";
import { AUDIT_ACTIONS } from "../models/AuditLog.js";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export const listAuditLogsQuerySchema = z.object({
  action: z.enum(AUDIT_ACTIONS).optional(),
  targetType: z
    .enum([
      "User",
      "AdminInvite",
      "Game",
      "Package",
      "Order",
      "Refund",
      "PaymentConfig",
    ])
    .optional(),
  reference: z
    .string()
    .regex(/^OP-[A-HJ-NP-Z2-9]{8}$/)
    .optional(),
  dateFrom: dateString.optional(),
  dateTo: dateString.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(25),
});

export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuerySchema>;
