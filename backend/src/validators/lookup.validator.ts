import { z } from "zod";

export const lookupBodySchema = z
  .object({
    playerId: z.string().trim().min(1).max(100),
    serverId: z.string().trim().max(20).optional(),
  })
  .strict();

export type LookupBody = z.infer<typeof lookupBodySchema>;
