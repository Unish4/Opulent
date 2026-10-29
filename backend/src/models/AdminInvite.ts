import { Schema, model, type Document, type Types } from "mongoose";
import type { UserRole } from "./User.js";

export const INVITE_STATUSES = ["pending", "accepted", "revoked"] as const;
export type InviteStatus = (typeof INVITE_STATUSES)[number];

export interface IAdminInvite extends Document {
  email: string;
  role: Exclude<UserRole, "customer">;
  invitedBy: Types.ObjectId;
  status: InviteStatus;
  acceptedAt?: Date;
  createdAt: Date;
}

const adminInviteSchema = new Schema<IAdminInvite>(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    role: { type: String, enum: ["operator", "owner"], required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: INVITE_STATUSES, default: "pending" },
    acceptedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

adminInviteSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } },
);

export const AdminInvite = model<IAdminInvite>(
  "AdminInvite",
  adminInviteSchema,
);
