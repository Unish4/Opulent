import { z } from "zod";

export const inviteSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email"),
  role: z.enum(["operator", "owner"]),
});

export type InviteFormValues = z.infer<typeof inviteSchema>;
