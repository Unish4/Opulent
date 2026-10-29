import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const inviteMemberSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    role: z.enum(["operator", "owner"]),
  })
  .strict();

export const setRoleSchema = z
  .object({
    role: z.enum(["customer", "operator", "owner"]),
    reason: z.string().trim().max(500).optional(),
  })
  .strict();

export const idParamSchema = z.object({ id: objectId });
