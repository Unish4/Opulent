import { Schema, model, type Document, type Types } from "mongoose";
import {
  ORDER_ACTIONS,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  type OrderAction,
  type OrderStatus,
  type PaymentStatus,
} from "../constants/orderTransitions.js";

export interface ITimelineEvent extends Document {
  orderId: Types.ObjectId;
  action: OrderAction | "created";
  fromStatus?: OrderStatus;
  toStatus: OrderStatus;
  fromPaymentStatus?: PaymentStatus;
  toPaymentStatus: PaymentStatus;
  actorType: "customer" | "admin" | "system";
  actorUserId?: Types.ObjectId;
  customerVisible: boolean;
  note?: string;
  createdAt: Date;
}

const timelineEventSchema = new Schema<ITimelineEvent>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    action: {
      type: String,
      enum: [...ORDER_ACTIONS, "created"],
      required: true,
    },
    fromStatus: { type: String, enum: ORDER_STATUSES },
    toStatus: { type: String, enum: ORDER_STATUSES, required: true },
    fromPaymentStatus: { type: String, enum: PAYMENT_STATUSES },
    toPaymentStatus: { type: String, enum: PAYMENT_STATUSES, required: true },
    actorType: {
      type: String,
      enum: ["customer", "admin", "system"],
      required: true,
    },
    actorUserId: { type: Schema.Types.ObjectId, ref: "User" },
    customerVisible: { type: Boolean, default: true },
    note: { type: String, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

timelineEventSchema.index({ orderId: 1, createdAt: 1 });

export const TimelineEvent = model<ITimelineEvent>(
  "TimelineEvent",
  timelineEventSchema,
);
