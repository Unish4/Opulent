import { z } from "zod";
import { ENV } from "../config/env.js";

export const paymentConfigSchema = z
  .object({
    methodLabel: z.string().trim().min(2).max(40),
    recipientName: z.string().trim().min(2).max(80),
    qrImageUrl: z
      .string()
      .url()
      .refine(
        (value) =>
          value.startsWith(
            `https://res.cloudinary.com/${ENV.CLOUDINARY.CLOUD_NAME}/`,
          ),
        {
          message: "The QR image must be uploaded through the admin uploader",
        },
      ),
    whatsappNumber: z
      .string()
      .trim()
      .regex(/^\d{10,15}$/, "Digits only, with country code"),
    instructions: z.string().trim().max(1000),
  })
  .strict();

export type PaymentConfigBody = z.infer<typeof paymentConfigSchema>;
