import type { Types } from "mongoose";
import { AuditLog, type AuditAction } from "../models/AuditLog.js";

interface AuditInput {
  actorUserId?: Types.ObjectId;
  action: AuditAction;
  targetType: string;
  targetId: string;
  reason?: string;
  change?: Record<string, unknown>;
  requestId?: string;
}

export const writeAuditLog = async (input: AuditInput): Promise<void> => {
  await AuditLog.create(input);
};
