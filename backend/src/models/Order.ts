import { Schema, model, type Document, type Types } from "mongoose";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type OrderStatus,
  type PaymentStatus,
} from "../constants/orderTransitions.js";
import { PACKAGE_TYPES, type PackageType } from "./Package.js";

export const NAME_SOURCES = [
  "lookup",
  "customer_typed",
  "not_applicable",
] as const;
export type NameSource = (typeof NAME_SOURCES)[number];

export interface IOrder extends Document {
  reference: string;
  userId: Types.ObjectId;
  gameId: Types.ObjectId;
  packageId: Types.ObjectId;
  gameSnapshot: { name: string; slug: string };
  packageSnapshot: {
    name: string;
    group: string;
    type: PackageType;
    description?: string;
  };
  playerDetails: {
    playerId?: string;
    serverId?: string;
    playerName?: string;
    email?: string;
    playerNameSource: NameSource;
  };
  lookupSnapshot?: {
    playerName: string;
    level: number | null;
    region: string | null;
    provider: string;
    checkedAt: Date;
  };
  pricePaisaSnapshot: number;
  costPaisaSnapshot?: number;
  currency: "NPR";
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  version: number;
  claimedBy?: Types.ObjectId | null;
  paymentConfirmation?: {
    payments: { esewaTxnId: string; amountPaisa: number }[];
    totalReceivedPaisa: number;
    overpaidPaisa: number;
    confirmedBy: Types.ObjectId;
    confirmedAt: Date;
  };
  completion?: { seenPlayerName: string; completedBy: Types.ObjectId };
  idempotencyKey?: string;
  proofSignalAt?: Date | null;
  paymentConfirmedAt?: Date | null;
  claimedAt?: Date | null;
  heldAt?: Date | null;
  holdReason?: string | null;
  holdPreviousStatus?: OrderStatus | null;
  completedAt?: Date | null;
  failedAt?: Date | null;
  failureReason?: string | null;
  rejectedAt?: Date | null;
  rejectionReason?: string | null;
  cancelledAt?: Date | null;
  cancellationReason?: string | null;
  reopenedAt?: Date | null;
  reopenReason?: string | null;
  lastReminderAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema(
  {
    esewaTxnId: { type: String, required: true },
    amountPaisa: { type: Number, required: true },
  },
  { _id: false },
);

const paymentConfirmationSchema = new Schema(
  {
    payments: { type: [paymentSchema], default: [] },
    totalReceivedPaisa: { type: Number, required: true },
    overpaidPaisa: { type: Number, required: true },
    confirmedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    confirmedAt: { type: Date, required: true },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder>(
  {
    reference: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    gameId: { type: Schema.Types.ObjectId, ref: "Game", required: true },
    packageId: { type: Schema.Types.ObjectId, ref: "Package", required: true },
    gameSnapshot: {
      name: { type: String, required: true },
      slug: { type: String, required: true },
    },
    packageSnapshot: {
      name: { type: String, required: true },
      group: { type: String, required: true },
      type: { type: String, enum: PACKAGE_TYPES, required: true },
      description: { type: String },
    },
    playerDetails: {
      playerId: { type: String },
      serverId: { type: String },
      playerName: { type: String },
      email: { type: String },
      playerNameSource: { type: String, enum: NAME_SOURCES, required: true },
    },
    lookupSnapshot: {
      type: new Schema(
        {
          playerName: { type: String, required: true },
          level: { type: Number, default: null },
          region: { type: String, default: null },
          provider: { type: String, required: true },
          checkedAt: { type: Date, required: true },
        },
        { _id: false },
      ),
      default: undefined,
    },
    pricePaisaSnapshot: { type: Number, required: true },
    costPaisaSnapshot: { type: Number },
    currency: { type: String, enum: ["NPR"], default: "NPR" },
    status: { type: String, enum: ORDER_STATUSES, default: "pending_payment" },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "unpaid" },
    version: { type: Number, default: 0 },
    claimedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    paymentConfirmation: {
      type: paymentConfirmationSchema,
      default: undefined,
    },
    completion: {
      type: new Schema(
        {
          seenPlayerName: { type: String, required: true },
          completedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
        },
        { _id: false },
      ),
      default: undefined,
    },
    idempotencyKey: { type: String },
    proofSignalAt: { type: Date, default: null },
    paymentConfirmedAt: { type: Date, default: null },
    claimedAt: { type: Date, default: null },
    heldAt: { type: Date, default: null },
    holdReason: { type: String, default: null },
    holdPreviousStatus: {
      type: String,
      enum: [...ORDER_STATUSES, null],
      default: null,
    },
    completedAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
    failureReason: { type: String, default: null },
    rejectedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: null },
    cancelledAt: { type: Date, default: null },
    cancellationReason: { type: String, default: null },
    reopenedAt: { type: Date, default: null },
    reopenReason: { type: String, default: null },
    lastReminderAt: { type: Date, default: null },
  },
  { timestamps: true },
);

orderSchema.index(
  { userId: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: { idempotencyKey: { $type: "string" } },
  },
);
orderSchema.index(
  { "paymentConfirmation.payments.esewaTxnId": 1 },
  {
    unique: true,
    partialFilterExpression: {
      "paymentConfirmation.payments.esewaTxnId": { $type: "string" },
    },
  },
);
orderSchema.index({ status: 1, createdAt: 1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ claimedBy: 1, status: 1 });

export const Order = model<IOrder>("Order", orderSchema);
