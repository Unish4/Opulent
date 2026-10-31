import { z } from "zod";

export const myOrdersQuerySchema = z.object({
  group: z.enum(["active", "completed", "closed", "all"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type MyOrdersQuery = z.infer<typeof myOrdersQuerySchema>;
