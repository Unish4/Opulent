import { z } from "zod";
import { objectId } from "./common.validator.js";

export const createOrderSchema = z
  .object({
    gameSlug: z
      .string()
      .max(60)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid game slug"),
    packageId: objectId,
    expectedPricePaisa: z.number().int().positive().max(10_000_000),
    playerDetails: z.record(z.string().max(30), z.string().max(100)),
    lookupToken: z.string().min(20).max(2000).optional(),
  })
  .strict();

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const referenceParamSchema = z.object({
  reference: z
    .string()
    .regex(/^OP-[A-HJ-NP-Z2-9]{8}$/, "Invalid order reference"),
});
