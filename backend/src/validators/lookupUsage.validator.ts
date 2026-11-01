import { z } from "zod";

export const adjustUsageSchema = z
  .object({
    group: z.string().regex(/^[a-z0-9-]{2,60}$/),
    used: z.number().int().min(0).max(100000),
  })
  .strict();

export type AdjustUsageBody = z.infer<typeof adjustUsageSchema>;
