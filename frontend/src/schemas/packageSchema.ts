import { z } from "zod";

export const packageFormSchema = z.object({
  group: z.string().trim().min(1, "Group is required").max(40),
  name: z.string().trim().min(1, "Name is required").max(80),
  type: z.enum(["topup", "pass", "bundle"]),
  priceNpr: z
    .string()
    .trim()
    .refine(
      (value) =>
        value !== "" && Number.isFinite(Number(value)) && Number(value) > 0,
      {
        message: "Enter a price greater than 0",
      },
    ),
  costNpr: z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0),
      {
        message: "Enter a valid cost",
      },
    ),
  description: z.string().trim().max(120),
  badge: z.string().trim().max(20),
  sortOrder: z
    .string()
    .trim()
    .refine((value) => /^\d+$/.test(value), {
      message: "Whole number, 0 or more",
    }),
});

export type PackageFormValues = z.infer<typeof packageFormSchema>;
