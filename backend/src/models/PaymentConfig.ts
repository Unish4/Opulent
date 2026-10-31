import { Schema, model, type Document } from "mongoose";

export interface IPaymentConfig extends Document {
  key: string;
  methodLabel: string;
  recipientName: string;
  qrImageUrl: string;
  whatsappNumber: string;
  instructions: string;
  updatedAt: Date;
}

const paymentConfigSchema = new Schema<IPaymentConfig>(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    methodLabel: { type: String, required: true, trim: true, maxlength: 40 },
    recipientName: { type: String, required: true, trim: true, maxlength: 80 },
    qrImageUrl: { type: String, required: true, trim: true },
    whatsappNumber: {
      type: String,
      required: true,
      match: [
        /^\d{10,15}$/,
        "WhatsApp number must be digits only, with country code",
      ],
    },
    instructions: { type: String, trim: true, maxlength: 1000, default: "" },
  },
  { timestamps: true },
);

export const PaymentConfig = model<IPaymentConfig>(
  "PaymentConfig",
  paymentConfigSchema,
);
