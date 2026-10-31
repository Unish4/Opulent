import type { ClientSession, Types } from "mongoose";
import { AuditLog, type AuditAction } from "../models/AuditLog.js";

interface AuditInput {
  actorUserId?: Types.ObjectId | string;
  action: AuditAction;
  targetType: string;
  targetId: string;
  reason?: string;
  change?: Record<string, unknown>;
  requestId?: string;
  session?: ClientSession;
}

export const writeAuditLog = async ({
  session,
  ...input
}: AuditInput): Promise<void> => {
  await AuditLog.create([input], session ? { session } : undefined);
};
