import { Schema, model, type Document, type Types } from "mongoose";

export const REFUND_STATUSES = [
  "requested",
  "approved",
  "denied",
  "paid_out",
] as const;
export type RefundStatus = (typeof REFUND_STATUSES)[number];

export const REFUND_REASONS = [
  "failed_topup",
  "wrong_account",
  "not_received",
  "overpayment",
  "duplicate_payment",
  "wrong_order_payment",
  "late_payment",
  "admin_mistake",
  "cancelled_after_payment",
  "other",
] as const;
export type RefundReason = (typeof REFUND_REASONS)[number];

export interface IRefund extends Document {
  orderId?: Types.ObjectId | null;
  orderReference?: string | null;
  userId?: Types.ObjectId | null;
  incomingEsewaTxnIds: string[];
  amountPaisa: number;
  reasonCode: RefundReason;
  note: string;
  status: RefundStatus;
  requestedByType: "customer" | "admin";
  requestedBy?: Types.ObjectId | null;
  decidedBy?: Types.ObjectId | null;
  decidedAt?: Date | null;
  decisionNote?: string | null;
  paidOutBy?: Types.ObjectId | null;
  paidOutAt?: Date | null;
  paidOutTxnId?: string | null;
  lastReminderAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const refundSchema = new Schema<IRefund>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    orderReference: { type: String, default: null },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    incomingEsewaTxnIds: { type: [String], default: [] },
    amountPaisa: {
      type: Number,
      required: true,
      validate: {
        validator: (value: number) =>
          Number.isSafeInteger(value) && value > 0 && value <= 10_000_000,
        message:
          "Refund amount must be a positive whole number of paisa, up to Rs 100,000",
      },
    },
    reasonCode: { type: String, enum: REFUND_REASONS, required: true },
    note: { type: String, required: true, trim: true, maxlength: 500 },
    status: { type: String, enum: REFUND_STATUSES, default: "requested" },
    requestedByType: {
      type: String,
      enum: ["customer", "admin"],
      required: true,
    },
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    decidedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    decidedAt: { type: Date, default: null },
    decisionNote: { type: String, maxlength: 500, default: null },
    paidOutBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    paidOutAt: { type: Date, default: null },
    paidOutTxnId: { type: String, default: null },
    lastReminderAt: { type: Date, default: null },
  },
  { timestamps: true },
);

refundSchema.index({ status: 1, createdAt: 1 });
refundSchema.index({ orderId: 1 });
refundSchema.index({ orderReference: 1 });
refundSchema.index({ incomingEsewaTxnIds: 1 });
refundSchema.index(
  { paidOutTxnId: 1 },
  {
    unique: true,
    partialFilterExpression: { paidOutTxnId: { $type: "string" } },
  },
);

export const Refund = model<IRefund>("Refund", refundSchema);
