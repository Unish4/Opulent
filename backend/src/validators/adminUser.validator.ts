import { z } from "zod";

export const listUsersQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  role: z.enum(["customer", "operator", "owner"]).default("customer"),
  status: z.enum(["active", "suspended", "deleted"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const setUserStatusSchema = z
  .object({
    status: z.enum(["active", "suspended"]),
    reason: z.string().trim().max(500).optional(),
  })
  .strict();

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type SetUserStatusBody = z.infer<typeof setUserStatusSchema>;
