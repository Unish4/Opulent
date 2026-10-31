import { z } from "zod";

export const paymentConfigFormSchema = z.object({
  methodLabel: z.string().trim().min(2, "Enter a name").max(40),
  recipientName: z.string().trim().min(2, "Enter the recipient name").max(80),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^\d{10,15}$/, "Digits only, with country code e.g 9779843642087"),
  instructions: z.string().trim().max(1000),
  qrImageUrl: z.string().url("Upload the QR image"),
});

export type PaymentConfigFormValues = z.infer<typeof paymentConfigFormSchema>;
