import { z } from "zod";
import { PACKAGE_TYPES } from "../models/Package.js";

const twoDecimals = (value: number): boolean =>
  Math.abs(value * 100 - Math.round(value * 100)) < 1e-6;

const priceSchema = z
  .number()
  .positive()
  .max(100000)
  .refine(twoDecimals, "Use at most 2 decimal places");
const costSchema = z
  .number()
  .min(0)
  .max(100000)
  .refine(twoDecimals, "Use at most 2 decimal places");

const packageShape = {
  group: z.string().trim().min(1).max(40),
  name: z.string().trim().min(1).max(80),
  type: z.enum(PACKAGE_TYPES),
  description: z.string().trim().max(120),
  badge: z.string().trim().max(20),
  priceNpr: priceSchema,
  costNpr: costSchema.nullable(),
  sortOrder: z.number().int().min(0).max(10000),
};

export const createPackageSchema = z
  .object({
    ...packageShape,
    description: packageShape.description.optional(),
    badge: packageShape.badge.optional(),
    costNpr: packageShape.costNpr.optional(),
  })
  .strict();

export const updatePackageSchema = z.object(packageShape).partial().strict();

export const packageAvailabilitySchema = z
  .object({ isAvailable: z.boolean() })
  .strict();

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
