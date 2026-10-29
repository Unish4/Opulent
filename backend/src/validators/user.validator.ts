import { z } from "zod";

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be 2-50 characters")
      .max(50)
      .optional(),
    phone: z
      .string()
      .trim()
      .regex(/^(\+977)?(97|98)\d{8}$/, "Enter a valid Nepali mobile number")
      .optional(),
  })
  .strict();
