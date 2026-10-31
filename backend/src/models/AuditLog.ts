import { Schema, model, type Document, type Types } from "mongoose";

export const AUDIT_ACTIONS = [
  "user_role_changed",
  "admin_invite_created",
  "admin_invite_revoked",
  "admin_invite_accepted",
  "owner_bootstrapped",
  "game_created",
  "game_updated",
  "game_published",
  "game_unpublished",
  "game_availability_changed",
  "package_created",
  "package_updated",
  "package_price_changed",
  "package_availability_changed",
  "order_payment_confirmed",
  "order_payment_rejected",
  "order_held",
  "order_hold_released",
  "order_completed",
  "order_failed",
  "order_retried",
  "order_cancelled",
  "order_claim_reassigned",
  "order_reopened",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export interface IAuditLog extends Document {
  actorUserId?: Types.ObjectId;
  action: AuditAction;
  targetType: string;
  targetId: string;
  reason?: string;
  change?: Record<string, unknown>;
  requestId?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorUserId: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, enum: AUDIT_ACTIONS, required: true },
    targetType: { type: String, required: true },
    targetId: { type: String, required: true },
    reason: { type: String, maxlength: 500 },
    change: { type: Schema.Types.Mixed },
    requestId: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });

const forbid = () => {
  throw new Error("Audit logs are append-only");
};
auditLogSchema.pre(
  [
    "updateOne",
    "updateMany",
    "findOneAndUpdate",
    "findOneAndDelete",
    "deleteOne",
    "deleteMany",
  ],
  forbid,
);

export const AuditLog = model<IAuditLog>("AuditLog", auditLogSchema);
