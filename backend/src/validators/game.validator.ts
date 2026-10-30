import { z } from "zod";

export const listGamesQuerySchema = z.object({
  search: z.string().trim().max(60).optional(),
  featured: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ListGamesQuery = z.infer<typeof listGamesQuerySchema>;

export const slugParamSchema = z.object({
  slug: z
    .string()
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid game slug"),
});
