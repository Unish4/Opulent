import { z } from "zod";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from "../constants/orderTransitions.js";
import { objectId } from "./common.validator.js";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export const listOrdersQuerySchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  game: z
    .string()
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  assignee: z.enum(["me", "unclaimed"]).optional(),
  q: z.string().trim().max(100).optional(),
  dateFrom: dateString.optional(),
  dateTo: dateString.optional(),
  sort: z.enum(["oldest", "newest"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;

const twoDecimals = (value: number): boolean =>
  Math.abs(value * 100 - Math.round(value * 100)) < 1e-6;

const reason = z.string().trim().min(1, "A reason is required").max(500);

export const confirmPaymentSchema = z
  .object({
    payments: z
      .array(
        z
          .object({
            esewaTxnId: z.string().trim().min(4).max(40),
            amountNpr: z
              .number()
              .positive()
              .max(100000)
              .refine(twoDecimals, "Use at most 2 decimal places"),
          })
          .strict(),
      )
      .min(1)
      .max(5),
    excessAcknowledged: z.boolean().optional(),
  })
  .strict();

export const reasonSchema = z.object({ reason }).strict();
export const noteSchema = z
  .object({ note: z.string().trim().max(500).optional() })
  .strict();
export const completeSchema = z
  .object({ seenPlayerName: z.string().trim().min(1).max(60) })
  .strict();
export const reassignSchema = z.object({ claimantId: objectId }).strict();
export const reopenSchema = z.object({ reason, claimantId: objectId }).strict();

export type ConfirmPaymentBody = z.infer<typeof confirmPaymentSchema>;
export type ReasonBody = z.infer<typeof reasonSchema>;
export type NoteBody = z.infer<typeof noteSchema>;
export type CompleteBody = z.infer<typeof completeSchema>;
export type ReassignBody = z.infer<typeof reassignSchema>;
export type ReopenBody = z.infer<typeof reopenSchema>;
