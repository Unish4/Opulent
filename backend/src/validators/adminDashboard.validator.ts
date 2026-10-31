import { z } from "zod";

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export const rangeQuerySchema = z.object({
  from: dateString.optional(),
  to: dateString.optional(),
});

export type RangeQuery = z.infer<typeof rangeQuerySchema>;
